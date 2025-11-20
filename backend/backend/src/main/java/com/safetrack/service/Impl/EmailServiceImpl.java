package com.safetrack.service.Impl;

import com.safetrack.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.scheduling.annotation.Async;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async // Para no bloquear el hilo principal de la aplicación
    @Override
    public void sendPasswordResetEmail(String to, String username, String resetUrl) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Recuperación de Contraseña para SafeTrack");

            String emailContent = String.format("""
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                        <h2 style="color: #0056b3;">Hola %s,</h2>
                        <p>Hemos recibido una solicitud para restablecer tu contraseña en SafeTrack.</p>
                        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                        <p style="text-align: center;">
                            <a href="%s" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px;">
                                Restablecer Contraseña
                            </a>
                        </p>
                        <p>Si no solicitaste un restablecimiento de contraseña, por favor ignora este correo.</p>
                        <p>Este enlace expirará en 1 hora.</p>
                        <p>Saludos cordiales,</p>
                        <p>El equipo de SafeTrack</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;">
                        <p style="font-size: 0.8em; color: #999;">Si tienes problemas para hacer clic en el botón "Restablecer Contraseña", copia y pega la siguiente URL en tu navegador web:</p>
                        <p style="font-size: 0.8em; color: #999;">%s</p>
                    </div>
                </body>
                </html>
                """, username, resetUrl, resetUrl);

            helper.setText(emailContent, true); // true para contenido HTML
            mailSender.send(message);
            log.info("Correo de recuperación enviado exitosamente a: {}", to);
        } catch (MessagingException e) {
            log.error("Error al enviar el correo de recuperación a {}: {}", to, e.getMessage());
            // Podrías lanzar una excepción personalizada o manejar el error de otra manera
            throw new RuntimeException("Error al enviar el correo electrónico.", e);
        }
    }
}
