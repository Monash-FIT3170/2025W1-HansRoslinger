output "repository_id" {
  description = "The Artifact Registry repository ID"
  value       = google_artifact_registry_repository.repo.id
}

output "bucket_name" {
  description = "The name of the GCS bucket"
  value       = google_storage_bucket.bucket.name
}
