import {beforeEach, describe, expect, it, vi} from "vitest";

const stageWebsiteLeadSubmissionMock = vi.fn();
const findFirstMock = vi.fn();

vi.mock("@/lib/intake/website-lead", async () => {
  const actual = await vi.importActual<typeof import("@/lib/intake/website-lead")>("@/lib/intake/website-lead");

  return {
    ...actual,
    stageWebsiteLeadSubmission: stageWebsiteLeadSubmissionMock
  };
});

vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    user: {
      findFirst: findFirstMock
    }
  }
}));

describe("POST /api/intake/website-lead", () => {
  beforeEach(() => {
    vi.resetModules();
    stageWebsiteLeadSubmissionMock.mockReset();
    findFirstMock.mockReset();
    delete process.env.DATABASE_URL;
    delete process.env.CRM_WEBSITE_INTAKE_TOKEN;
    delete process.env.CRM_WEBSITE_INTAKE_ALLOWED_ORIGINS;
    delete process.env.CRM_PUBLIC_INTAKE_UPLOADED_BY_ID;
  });

  it("stages a valid website submission", async () => {
    stageWebsiteLeadSubmissionMock.mockResolvedValue({batchId: "batch_1", batchStatus: "ready"});

    const {POST} = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/intake/website-lead", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          companyName: "Orbit Labs",
          contactFullName: "Dana Founder",
          email: "dana@orbit.test",
          phone: "+1 555 0100",
          website: "orbit.test",
          notes: "Interested in a demo",
          sourceRef: "/contact",
          locale: "en"
        })
      })
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ok: true});
    expect(stageWebsiteLeadSubmissionMock).toHaveBeenCalledTimes(1);
    expect(stageWebsiteLeadSubmissionMock.mock.calls[0]?.[0]).toMatchObject({
      uploadedById: "user_admin",
      requestMeta: {
        origin: null,
        referer: null,
        ip: null
      }
    });
  });

  it("returns accepted for honeypot submissions without staging", async () => {
    const {POST} = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/intake/website-lead", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          email: "dana@orbit.test",
          _hp: "bot"
        })
      })
    );

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ok: true});
    expect(stageWebsiteLeadSubmissionMock).not.toHaveBeenCalled();
  });

  it("rejects invalid payloads before staging", async () => {
    const {POST} = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/intake/website-lead", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          unexpected: "field"
        })
      })
    );

    expect(response.status).toBe(400);
    expect(stageWebsiteLeadSubmissionMock).not.toHaveBeenCalled();
  });

  it("uses an active admin uploader in db-backed mode", async () => {
    process.env.DATABASE_URL = "postgres://crm.test/db";
    findFirstMock.mockResolvedValue({id: "admin_db"});
    stageWebsiteLeadSubmissionMock.mockResolvedValue({batchId: "batch_1", batchStatus: "ready"});

    const {POST} = await import("./route");
    await POST(
      new Request("http://localhost/api/intake/website-lead", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          companyName: "Orbit Labs",
          contactFullName: "Dana Founder",
          email: "dana@orbit.test"
        })
      })
    );

    expect(findFirstMock).toHaveBeenCalledTimes(1);
    expect(stageWebsiteLeadSubmissionMock.mock.calls[0]?.[0]).toMatchObject({
      uploadedById: "admin_db"
    });
  });
});
