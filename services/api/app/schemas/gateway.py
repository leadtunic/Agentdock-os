from datetime import datetime

from pydantic import BaseModel, Field


class ChannelConnectionBase(BaseModel):
    channel_type: str
    name: str
    config: dict = Field(default_factory=dict)
    is_active: bool = True


class ChannelConnectionCreate(ChannelConnectionBase):
    organization_id: str | None = None
    project_id: str | None = None


class ChannelConnectionUpdate(BaseModel):
    channel_type: str | None = None
    name: str | None = None
    config: dict | None = None
    is_active: bool | None = None


class ChannelConnectionResponse(ChannelConnectionBase):
    id: str
    organization_id: str | None
    project_id: str | None
    connected_at: datetime | None
    last_message_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class WebhookEventResponse(BaseModel):
    id: str
    channel_id: str
    event_type: str
    payload: dict
    task_id: str | None
    processed: bool
    processed_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class NotificationResponse(BaseModel):
    id: str
    organization_id: str | None
    user_id: str | None
    task_id: str | None
    approval_id: str | None
    notification_type: str
    title: str
    message: str
    channel: str | None
    is_read: bool
    read_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class WebhookPayload(BaseModel):
    channel: str
    event_type: str
    payload: dict = Field(default_factory=dict)


class WebhookResponse(BaseModel):
    success: bool
    task_id: str | None = None
    message: str
