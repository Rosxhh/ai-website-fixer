from django.db import models

class WebsiteScan(models.Model):
    url = models.URLField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Overall and sub-scores
    score_overall = models.IntegerField(default=0)
    score_seo = models.IntegerField(default=0)
    score_accessibility = models.IntegerField(default=0)
    score_performance = models.IntegerField(default=0)
    
    # Store issues and suggestions as JSON
    # (Using TextField for simplified compatibility with older Django versions/SQLite if JSONField isn't ready)
    issues_json = models.TextField(default="[]")
    suggestions_json = models.TextField(default="[]")
    
    # Asset metrics (optional, but good for SaaS)
    page_weight_kb = models.FloatField(default=0.0)
    load_time_seconds = models.FloatField(default=0.0)

    def __str__(self):
        return f"{self.url} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"

class Comparison(models.Model):
    url_a = models.URLField()
    url_b = models.URLField()
    scan_a = models.ForeignKey(WebsiteScan, related_name='scan_a', on_delete=models.CASCADE)
    scan_b = models.ForeignKey(WebsiteScan, related_name='scan_b', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comparison: {self.url_a} vs {self.url_b}"
