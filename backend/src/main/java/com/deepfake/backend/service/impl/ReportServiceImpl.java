package com.deepfake.backend.service.impl;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.model.Media;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeTypeUtils;

import com.deepfake.backend.dto.ReportRequest;
import com.deepfake.backend.service.ReportService;

import java.net.MalformedURLException;
import java.util.List;

@Service
public class ReportServiceImpl implements ReportService {

    private final ChatClient chatClient;

    public ReportServiceImpl(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @Override
    public String generateReport(ReportRequest request) {
        String promptText;
        double realScore = 100.0 - request.confidence();

        if (request.result().equalsIgnoreCase("DEEPFAKE") || request.result().equalsIgnoreCase("SAHTE")) {
            promptText = String.format(
                    "Sen Kıdemli bir Dijital Adli Tıp Uzmanısın. " +
                            "Ekteki ısı haritasını incele. Analiz sonucu: %% %.2f olasılıkla %s. " +
                            "Kırmızı/sarı alanlar manipüle edilmiş pikselleri temsil eder. " +
                            "Aşağıdaki 3 başlıkta çok resmi bir adli rapor yaz. Giriş ve tarih kısımlarını YAZMA.\n\n" +
                            "1. Tespit Edilen Anatomik Bölgeler\n" +
                            "2. Manipülasyonun Niteliği\n" +
                            "3. Nihai Adli Sonuç",
                    request.confidence(), request.result());
        } else {

            promptText = String.format(
                    "Sen Kıdemli bir Dijital Adli Tıp Uzmanısın. " +
                            "Ekteki ısı haritasını incele. Analiz sonucu: %% %.1f GERÇEK. " +
                            "Isı haritasındaki renkli bölgeler manipülasyon değil, modelin biyolojik referans noktalarıdır. "
                            +
                            "Lütfen görselin orijinalliğini doğrulayan 3 başlıklı resmi bir rapor yaz. Giriş kısımlarını YAZMA.\n\n"
                            +
                            "1. İncelenen Doğal Alanlar\n" +
                            "2. Orijinallik Analizi (Piksel bütünlüğü neden korunmuş açıkla)\n" +
                            "3. Nihai Adli Sonuç (Görselin güvenilir olduğunu belirt)",
                    realScore);
        }

        try {
            var imageResource = new UrlResource(request.heatmap_url());
            var userMessage = new UserMessage(promptText,
                    List.of(new Media(MimeTypeUtils.IMAGE_JPEG, imageResource)));

            return chatClient.prompt()
                    .messages(userMessage)
                    .call()
                    .content();

        } catch (MalformedURLException e) {
            return "Rapor oluşturulamadı: Görsel URL'si geçersiz.";
        } catch (Exception e) {
            return "Rapor oluşturulmadı";
        }
    }
}