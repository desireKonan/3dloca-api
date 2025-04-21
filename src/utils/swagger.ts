import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function swaggerConfig(app: INestApplication) {
    const config = new DocumentBuilder()
        .setTitle('3DLoca API')
        .setDescription('The 3DLoca API description')
        .setVersion('1.0')
        .addTag('3dloca')
        .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);
}