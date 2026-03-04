package com.stage.auth.authbackend.service.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Async("taskExecutor")
    public void sendVerificationEmail(String toEmail, String token) {

        String verificationLink = frontendUrl + "/verify?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Vérification de votre compte");
        message.setText(
                "Bonjour,\n\n" +
                        "Cliquez sur le lien suivant pour activer votre compte :\n\n" +
                        verificationLink +
                        "\n\nCe lien expirera prochainement."
        );

        // En environnement de dev, on ne veut pas que l'échec d'envoi mail bloque l'inscription
        try {
            mailSender.send(message);
        } catch (MailException e) {
            // TODO: logger proprement (logger.warn(...)) si tu ajoutes un logger
            System.err.println("Échec d'envoi de l'email de vérification : " + e.getMessage());
        }
    }

    @Async("taskExecutor")
    public void sendResetPasswordEmail(String toEmail, String token) {

        String resetLink = frontendUrl + "/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Réinitialisation de mot de passe");
        message.setText(
                "Cliquez sur le lien suivant pour réinitialiser votre mot de passe :\n\n" +
                        resetLink
        );

        try {
            mailSender.send(message);
        } catch (MailException e) {
            System.err.println("Échec d'envoi de l'email de réinitialisation : " + e.getMessage());
        }
    }
}
