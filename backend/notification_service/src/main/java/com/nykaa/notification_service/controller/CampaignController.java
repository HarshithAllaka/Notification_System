package com.nykaa.notification_service.controller;

import com.nykaa.notification_service.dto.CampaignRequest;
import com.nykaa.notification_service.dto.RecipientDto;
import com.nykaa.notification_service.entity.Campaign;
import com.nykaa.notification_service.service.CampaignService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/campaigns")
public class CampaignController {

    @Autowired
    private CampaignService campaignService;

    @PostMapping("/create")
    public ResponseEntity<String> createCampaign(@RequestBody CampaignRequest request) {
        campaignService.executeCampaign(request);
        return ResponseEntity.ok("Campaign launched successfully!");
    }

    @GetMapping("/history")
    public ResponseEntity<List<Campaign>> getHistory() {
        return ResponseEntity.ok(campaignService.getAllCampaigns());
    }

    @GetMapping("/{id}/recipients")
    public ResponseEntity<List<RecipientDto>> getRecipients(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.getCampaignRecipients(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCampaign(@PathVariable Long id) {
        campaignService.deleteCampaign(id);
        return ResponseEntity.ok("Campaign deleted");
    }

    // --- NEW UPDATE ENDPOINT ---
    @PutMapping("/{id}")
    public ResponseEntity<Campaign> updateCampaign(@PathVariable Long id, @RequestBody CampaignRequest request) {
        return ResponseEntity.ok(campaignService.updateCampaign(id, request));
    }
}