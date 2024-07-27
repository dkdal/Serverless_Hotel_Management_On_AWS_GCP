# Adapted from https://medium.com/google-cloud/deploying-docker-images-to-cloud-run-using-terraform-ee8ae4ecb72e

# Configure GCP project
provider "google" {
  project = "sdp-team-33"
}

# Deploy image to Cloud Run
resource "google_cloud_run_service" "web_app" {
  name     = "dalvacationhome"
  location = "us-central1"
  template {
    spec {
      containers {
        image = "gcr.io/sdp-team-33/dalvacationhome"
        ports {
          container_port = 8080
        }
        resources {
          limits = {
            memory = "2Gi"
            cpu    = "1"
          }
        }
      }
    }
  }
  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Create public access
data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

# Enable public access on Cloud Run service
resource "google_cloud_run_service_iam_policy" "noauth" {
  location    = google_cloud_run_service.web_app.location
  project     = google_cloud_run_service.web_app.project
  service     = google_cloud_run_service.web_app.name
  policy_data = data.google_iam_policy.noauth.policy_data
}

# Return service URL
output "url" {
  value = "${google_cloud_run_service.web_app.status[0].url}"
}
 