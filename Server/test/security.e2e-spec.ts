import { Test, TestingModule } from "@nestjs/testing";
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("Security (e2e)", () => {
  let app: INestApplication;
  let adminToken: string;
  let viewerToken: string;
  let productId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();

    const adminLogin = await request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({ email: "admin@skywin.aero", password: "admin123" });

    if (adminLogin.status !== 200) {
      console.warn(
        "Security e2e skipped: admin login failed — seed the database first",
      );
      return;
    }

    adminToken = adminLogin.body.accessToken;

    const viewerEmail = `viewer-security-${Date.now()}@test.com`;
    await request(app.getHttpServer())
      .post("/v1/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        fullName: "Security Viewer",
        email: viewerEmail,
        role: "viewer",
        password: "ViewerPass123!",
      });

    const viewerLogin = await request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({ email: viewerEmail, password: "ViewerPass123!" });

    viewerToken = viewerLogin.body.accessToken;

    const productRes = await request(app.getHttpServer())
      .post("/v1/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Security Test Product",
        category: "Test",
        description: "Product for security tests",
        price: 1,
        image: "https://example.com/test.jpg",
        stock: 1,
        status: false,
      });

    productId = productRes.body.id;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it("rejects unauthenticated PATCH on products", async () => {
    if (!productId) return;

    await request(app.getHttpServer())
      .patch(`/v1/products/${productId}`)
      .send({ name: "Hacked" })
      .expect(401);
  });

  it("rejects unauthenticated DELETE on products", async () => {
    if (!productId) return;

    await request(app.getHttpServer())
      .delete(`/v1/products/${productId}`)
      .expect(401);
  });

  it("rejects viewer PATCH on products with 403", async () => {
    if (!productId || !viewerToken) return;

    await request(app.getHttpServer())
      .patch(`/v1/products/${productId}`)
      .set("Authorization", `Bearer ${viewerToken}`)
      .send({ name: "Viewer Hack" })
      .expect(403);
  });

  it("rejects viewer DELETE on products with 403", async () => {
    if (!productId || !viewerToken) return;

    await request(app.getHttpServer())
      .delete(`/v1/products/${productId}`)
      .set("Authorization", `Bearer ${viewerToken}`)
      .expect(403);
  });

  it("rejects token reuse after logout", async () => {
    if (!adminToken) return;

    const loginRes = await request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({ email: "admin@skywin.aero", password: "admin123" });

    const token = loginRes.body.accessToken;

    await request(app.getHttpServer())
      .post("/v1/auth/logout")
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    await request(app.getHttpServer())
      .get("/v1/auth/me")
      .set("Authorization", `Bearer ${token}`)
      .expect(401);
  });
});
