create type upload_status as enum (
  'INITIATED', 'UPLOADING', 'UPLOADED', 'ABORTED', 'FAILED', 'EXPIRED'
);

CREATE TABLE IF NOT EXISTS uploads (
    id uuid primary key default gen_random_uuid(),

    original_file_name text not null,
    file_extension text not null,
    size_bytes bigint not null,

    bucket text not null,
    object_key text,

    status upload_status not null default 'INITIATED',

    multipart_upload_id text,
    part_size_bytes int not null,
    expires_at timestamptz not null,

    uploaded_user_id uuid,
    uploaded_project uuid,
    uploaded_at timestamptz,

    etag text,

    error_code text,
    error_message text
);

create unique index on uploads (bucket, object_key);
