resource "google_artifact_registry_repository" "repo" {
  project        = var.project_id
  location       = var.region
  repository_id  = var.repository_name
  format         = "DOCKER"
  description    = "Docker repository for application images"
}

resource "google_storage_bucket" "bucket" {
  project                     = var.project_id
  name                        = var.bucket_name
  location                    = var.bucket_location
  storage_class               = "STANDARD"
  force_destroy               = true
  uniform_bucket_level_access = true

  soft_delete_policy {
    retention_duration_seconds = 0
  }
}