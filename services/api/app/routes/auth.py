from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.auth import (
    LoginRequest,
    OrganizationCreate,
    OrganizationMemberCreate,
    OrganizationMemberResponse,
    OrganizationResponse,
    OrganizationUpdate,
    PermissionCreate,
    PermissionResponse,
    ProjectCreate,
    ProjectMemberCreate,
    ProjectMemberResponse,
    ProjectResponse,
    ProjectUpdate,
    RoleCreate,
    RoleResponse,
    RoleUpdate,
    TokenResponse,
    UserCreate,
    UserResponse,
    UserUpdate,
)
from app.models.auth import (
    Organization,
    OrganizationMember,
    Permission,
    Project,
    ProjectMember,
    Role,
    RolePermission,
    User,
)
from app.security.auth import get_current_user
from app.audit.service import record_audit

router = APIRouter()


@router.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    from app.security.password import hash_password

    user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        is_superuser=user_data.is_superuser,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    record_audit(db, event_type="user.registered", user_id=user.id, resource_type="user", resource_id=user.id)
    return user


@router.post("/auth/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    from app.security.password import verify_password
    from app.security.jwt import create_access_token

    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not user.password_hash or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if user.status != "active":
        raise HTTPException(status_code=403, detail="Account is disabled")

    token = create_access_token({"sub": user.id, "email": user.email})
    record_audit(db, event_type="user.login", user_id=user.id, resource_type="user", resource_id=user.id)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.get("/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/auth/me", response_model=UserResponse)
def update_me(user_data: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    update_data = user_data.model_dump(exclude_unset=True)
    if "password" in update_data:
        from app.security.password import hash_password

        update_data["password_hash"] = hash_password(update_data.pop("password"))
    for key, value in update_data.items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/users", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin only")
    return db.query(User).all()


@router.post("/roles", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
def create_role(role_data: RoleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin only")

    role = Role(name=role_data.name, description=role_data.description)
    db.add(role)
    db.flush()

    for perm_id in role_data.permission_ids:
        rp = RolePermission(role_id=role.id, permission_id=perm_id)
        db.add(rp)

    db.commit()
    db.refresh(role)
    record_audit(db, event_type="role.created", user_id=current_user.id, resource_type="role", resource_id=role.id)
    return role


@router.get("/roles", response_model=list[RoleResponse])
def list_roles(db: Session = Depends(get_db)):
    return db.query(Role).all()


@router.put("/roles/{role_id}", response_model=RoleResponse)
def update_role(role_id: str, role_data: RoleUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin only")

    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    update_data = role_data.model_dump(exclude_unset=True)
    permission_ids = update_data.pop("permission_ids", None)
    for key, value in update_data.items():
        setattr(role, key, value)

    if permission_ids is not None:
        db.query(RolePermission).filter(RolePermission.role_id == role_id).delete()
        for perm_id in permission_ids:
            db.add(RolePermission(role_id=role_id, permission_id=perm_id))

    db.commit()
    db.refresh(role)
    return role


@router.post("/permissions", response_model=PermissionResponse, status_code=status.HTTP_201_CREATED)
def create_permission(perm_data: PermissionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin only")

    perm = Permission(resource=perm_data.resource, action=perm_data.action, description=perm_data.description)
    db.add(perm)
    db.commit()
    db.refresh(perm)
    return perm


@router.get("/permissions", response_model=list[PermissionResponse])
def list_permissions(db: Session = Depends(get_db)):
    return db.query(Permission).all()


@router.post("/organizations", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
def create_organization(org_data: OrganizationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Organization).filter(Organization.slug == org_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Organization slug already exists")

    org = Organization(name=org_data.name, slug=org_data.slug, plan=org_data.plan)
    db.add(org)
    db.flush()

    member = OrganizationMember(organization_id=org.id, user_id=current_user.id)
    db.add(member)
    db.commit()
    db.refresh(org)
    record_audit(db, event_type="organization.created", user_id=current_user.id, resource_type="organization", resource_id=org.id)
    return org


@router.get("/organizations", response_model=list[OrganizationResponse])
def list_organizations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    memberships = db.query(OrganizationMember).filter(OrganizationMember.user_id == current_user.id).all()
    org_ids = [m.organization_id for m in memberships]
    return db.query(Organization).filter(Organization.id.in_(org_ids)).all()


@router.get("/organizations/{org_id}", response_model=OrganizationResponse)
def get_organization(org_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


@router.put("/organizations/{org_id}", response_model=OrganizationResponse)
def update_organization(org_id: str, org_data: OrganizationUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    update_data = org_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(org, key, value)
    db.commit()
    db.refresh(org)
    return org


@router.post("/organizations/{org_id}/members", response_model=OrganizationMemberResponse, status_code=status.HTTP_201_CREATED)
def add_member(org_id: str, member_data: OrganizationMemberCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    existing = db.query(OrganizationMember).filter(
        OrganizationMember.organization_id == org_id,
        OrganizationMember.user_id == member_data.user_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already a member")

    member = OrganizationMember(organization_id=org_id, user_id=member_data.user_id, role_id=member_data.role_id)
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@router.get("/organizations/{org_id}/members", response_model=list[OrganizationMemberResponse])
def list_members(org_id: str, db: Session = Depends(get_db)):
    return db.query(OrganizationMember).filter(OrganizationMember.organization_id == org_id).all()


@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(project_data: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    org = db.query(Organization).filter(Organization.id == project_data.organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    project = Project(
        organization_id=project_data.organization_id,
        name=project_data.name,
        slug=project_data.slug,
        description=project_data.description,
    )
    db.add(project)
    db.flush()

    member = ProjectMember(project_id=project.id, user_id=current_user.id, role="owner")
    db.add(member)
    db.commit()
    db.refresh(project)
    record_audit(db, event_type="project.created", user_id=current_user.id, resource_type="project", resource_id=project.id)
    return project


@router.get("/projects", response_model=list[ProjectResponse])
def list_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    memberships = db.query(ProjectMember).filter(ProjectMember.user_id == current_user.id).all()
    project_ids = [m.project_id for m in memberships]
    return db.query(Project).filter(Project.id.in_(project_ids)).all()


@router.get("/projects/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put("/projects/{project_id}", response_model=ProjectResponse)
def update_project(project_id: str, project_data: ProjectUpdate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = project_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)
    db.commit()
    db.refresh(project)
    return project


@router.post("/projects/{project_id}/members", response_model=ProjectMemberResponse, status_code=status.HTTP_201_CREATED)
def add_project_member(project_id: str, member_data: ProjectMemberCreate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    existing = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == member_data.user_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already a member")

    member = ProjectMember(project_id=project_id, user_id=member_data.user_id, role=member_data.role)
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@router.get("/projects/{project_id}/members", response_model=list[ProjectMemberResponse])
def list_project_members(project_id: str, db: Session = Depends(get_db)):
    return db.query(ProjectMember).filter(ProjectMember.project_id == project_id).all()
