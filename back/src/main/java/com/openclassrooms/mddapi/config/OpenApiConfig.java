package com.openclassrooms.mddapi.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Documentation OpenAPI / Swagger UI avec authentification Bearer JWT.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI mddOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("MDD API")
                        .description("API du réseau social MDD (Monde de Dev)")
                        .version("v1"))
                .components(new Components().addSecuritySchemes("bearerAuth",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}

