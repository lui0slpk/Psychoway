/**
 * Strict TDD — Slice 5 (PR 5): behavior contract for src/api/psychologists.api.js.
 * Tests written FIRST (RED — module does not exist yet; old callers used the
 * misplaced meetingsApi.getPsychologists(authFetch)).
 * Parity reference: Backend/src/routes/index.js
 * `router.get("/api/psychologists", usersCtrl.getPsychologists)` (behind the
 * /api JWT middleware → client defaults: Bearer + 401 redirect).
 */
import psychologistsApi from "./psychologists.api";
import { API_URL, TOKEN_KEY } from "./config";
import { ApiError } from "./client";

beforeEach(() => {
  window.location.hash = "init";
  localStorage.clear();
  localStorage.setItem(TOKEN_KEY, "tok-slice5");
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

function jsonResponse(body, status = 200) {
  return {
    status,
    ok: status >= 200 && status < 300,
    async text() {
      return typeof body === "string" ? body : JSON.stringify(body);
    },
    async blob() {
      return new Blob([typeof body === "string" ? body : JSON.stringify(body)]);
    },
  };
}

describe("psychologistsApi.getAll", () => {
  it("GETs `${API_URL}/psychologists` with the Bearer token", async () => {
    global.fetch.mockResolvedValue(jsonResponse([]));

    await psychologistsApi.getAll();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe(`${API_URL}/psychologists`);
    expect(options.method).toBe("GET");
    expect(options.headers.Authorization).toBe("Bearer tok-slice5");
  });

  it("resolves the parsed psychologist list with real values (AgendaPage selector)", async () => {
    const psychologists = [
      { id_user: 3, names: "Ana", last_names: "García" },
      { id_user: 7, names: "Luis", last_names: "Pérez" },
    ];
    global.fetch.mockResolvedValue(jsonResponse(psychologists));

    const data = await psychologistsApi.getAll();

    expect(data).toHaveLength(2);
    expect(data[0].id_user).toBe(3);
    expect(data[0].names).toBe("Ana");
    expect(data[1].last_names).toBe("Pérez");
  });

  it("rejects ApiError(500) with the backend message on server error", async () => {
    global.fetch.mockResolvedValue(
      jsonResponse({ message: "Error interno del servidor" }, 500)
    );

    const error = await psychologistsApi.getAll().catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(500);
    expect(error.message).toBe("Error interno del servidor");
  });

  it("clears the session and redirects on 401 (protected endpoint)", async () => {
    global.fetch.mockResolvedValue(
      jsonResponse({ message: "Sesión expirada. Inicie sesión nuevamente." }, 401)
    );

    const error = await psychologistsApi.getAll().catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(401);
    expect(error.message).toBe("Sesión expirada");
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(window.location.pathname).toBe("/");
    expect(window.location.hash).toBe("");
  });
});
