## Steps to deploy to Cloud Run:

1. Install gcloud CLI: https://cloud.google.com/sdk/docs/install

2. Create Dockerfile

3. Build and push Docker image to Artifact Registry

`gcloud builds submit --tag gcr.io/sdp-team-33/dalvacationhome`

4. Create the Terraform file. Make sure you provide enough memory for the Cloud Run instance. Otherwise, you will run into issues like:

`FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory`

5. Upload the Terraform file on GCP Cloud Shell.

6. Type `terraform init` on GCP Cloud Shell.

7. Type `terraform apply` on GCP Cloud Shell.

## Debugging tip:

After applying the Terraform file, read the Cloud Run logs. I kept getting out-of-memory errors, so I increased the memory limit in the Terraform file.