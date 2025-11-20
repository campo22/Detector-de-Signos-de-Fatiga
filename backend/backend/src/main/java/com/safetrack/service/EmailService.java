package com.safetrack.service;

public interface EmailService {
    void sendPasswordResetEmail(String to, String username, String resetUrl);
}
