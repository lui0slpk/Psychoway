/**
 * Strict TDD — Slice 4 (PR 4): behavior contract for src/api/users.api.js.
 * Tests written FIRST (RED) against the old authFetch-based signature; the
 * module rewrite in users.api.js makes them green.
 * Parity reference: Backend/src/routes/users.routes.js (POST /users/create,
 * GET /users/search/:document, PUT /users/update/:id, DELETE /users/delete/:id,
 * GET/PUT /users/profile/:id, PUT /users/profile/:id/photo, GET /users/profile/:id/photo,
 * GET/PUT /users/privacy/:userId) + the inline authFetch calls previously living
 * in GestionPage.jsx / GestionModPage.jsx / PrivacidadPage.jsx.
 *
 * Design gotcha (obs #58): updateProfilePhoto sends JSON {profilePhoto} — the
 * base64 data-URL body, NOT FormData (backend users.controller destructures
 * `const { profilePhoto } = req.body`; MiCuentaPage embeds it the same way).
 */
import usersApi from "./users.api";
import { API_URL, TOKEN_KEY } from "./config";
import { ApiError } from "./client";

beforeEach(() => {
  window.location.hash = "init";
  localStorage.clear();
  localStorage.setItem(TOKEN_KEY, "tok-slice4");
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

describe("usersApi.create", () => {
  it("POSTs formData JSON to `${API_URL}/users/create` with the Bearer token", async () => {
    global.fetch.mockResolvedValue(
      jsonResponse({ message: "Usuario creado exitosamente", userId: 7 })
    );

    const formData = {
      rol: "aprendiz",
      documento: "1234567890",
      tipoDocumento: "CC",
      nombres: "Kevin",
      apellidos: "Chaverra",
      correo: "k@example.com",
      password: "Abcdef1!",
    };
    await usersApi.create(formData);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe(`${API_URL}/users/create`);
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe("Bearer tok-slice4");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.body).toBe(JSON.stringify(formData));
  });

  it("resolves the parsed success payload", async () => {
    global.fetch.mockResolvedValue(
      jsonResponse({ message: "Usuario creado exitosamente", userId: 7 })
    );

    const data = await usersApi.create({ rol: "aprendiz" });

    expect(data.userId).toBe(7);
    expect(data.message).toBe("Usuario creado exitosamente");
  });

  it("rejects ApiError(409) with the backend message on duplicate document/correo", async () => {
    global.fetch.mockResolvedValue(
      jsonResponse({ message: "El documento o correo ya existe" }, 409)
    );

    const error = await usersApi.create({ rol: "aprendiz" }).catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(409);
    expect(error.message).toBe("El documento o correo ya existe");
  });
});

describe("usersApi.search", () => {
  it("GETs `${API_URL}/users/search/:document` with the Bearer token and resolves the user", async () => {
    const user = {
      id_user: 42,
      document: "1234567890",
      tipoDocumento: "CC",
      rol: "aprendiz",
      nombres: "Kevin",
      apellidos: "Chaverra",
    };
    global.fetch.mockResolvedValue(jsonResponse(user));

    const data = await usersApi.search("1234567890");

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe(`${API_URL}/users/search/1234567890`);
    expect(options.method).toBe("GET");
    expect(options.headers.Authorization).toBe("Bearer tok-slice4");
    expect(data.id_user).toBe(42);
    expect(data.rol).toBe("aprendiz");
  });

  it("rejects ApiError(404) with an OBJECT data body on a JSON 404 (GestionModPage branch key)", async () => {
    global.fetch.mockResolvedValue(
      jsonResponse({ message: "Usuario no encontrado" }, 404)
    );

    const error = await usersApi.search("9999999999").catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(404);
    expect(error.message).toBe("Usuario no encontrado");
    // JSON body → parsed object → page shows `error.data.message || "Usuario no encontrado"`.
    expect(error.data).toEqual({ message: "Usuario no encontrado" });
    expect(typeof error.data).toBe("object");
  });

  it("rejects ApiError(404) with a NON-object data body on a non-JSON 404 (backend-down branch key)", async () => {
    global.fetch.mockResolvedValue(
      jsonResponse("<!doctype html><html>Not Found</html>", 404)
    );

    const error = await usersApi.search("9999999999").catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(404);
    // HTML body → raw text fallback → page shows "Error 404: El servicio no responde. Reinicia el backend."
    expect(typeof error.data).not.toBe("object");
    expect(error.data).toContain("<html>");
  });
});

describe("usersApi.update", () => {
  it("PUTs formData JSON to `${API_URL}/users/update/:id` with the Bearer token", async () => {
    global.fetch.mockResolvedValue(
      jsonResponse({ message: "Usuario actualizado correctamente" })
    );

    const formData = { rol: "psicologo", documento: "1234567890" };
    await usersApi.update(42, formData);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe(`${API_URL}/users/update/42`);
    expect(options.method).toBe("PUT");
    expect(options.headers.Authorization).toBe("Bearer tok-slice4");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.body).toBe(JSON.stringify(formData));
  });

  it("resolves the parsed success payload", async () => {
    global.fetch.mockResolvedValue(
      jsonResponse({ message: "Usuario actualizado correctamente" })
    );

    const data = await usersApi.update(42, { rol: "psicologo" });

    expect(data.message).toBe("Usuario actualizado correctamente");
  });
});

describe("usersApi.remove", () => {
  it("DELETEs `${API_URL}/users/delete/:id` without a body", async () => {
    global.fetch.mockResolvedValue(
      jsonResponse({ message: "Usuario eliminado correctamente" })
    );

    await usersApi.remove(42);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe(`${API_URL}/users/delete/42`);
    expect(options.method).toBe("DELETE");
    expect(options.headers.Authorization).toBe("Bearer tok-slice4");
    expect(options.body).toBeUndefined();
  });

  it("resolves the parsed success payload", async () => {
    global.fetch.mockResolvedValue(
      jsonResponse({ message: "Usuario eliminado correctamente" })
    );

    const data = await usersApi.remove(42);

    expect(data.message).toBe("Usuario eliminado correctamente");
  });
});

describe("usersApi.getProfile", () => {
  it("GETs `${API_URL}/users/profile/:id` with the Bearer token and resolves the profile", async () => {
    const profile = {
      id_user: 42,
      document: "1234567890",
      nombres: "Kevin",
      apellidos: "Chaverra",
      rol: "aprendiz",
      profile_photo: "data:image/png;base64,AAA",
    };
    global.fetch.mockResolvedValue(jsonResponse(profile));

    const data = await usersApi.getProfile(42);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe(`${API_URL}/users/profile/42`);
    expect(options.method).toBe("GET");
    expect(options.headers.Authorization).toBe("Bearer tok-slice4");
    expect(data.nombres).toBe("Kevin");
    expect(data.profile_photo).toBe("data:image/png;base64,AAA");
  });
});

describe("usersApi.updateProfile", () => {
  it("PUTs data JSON to `${API_URL}/users/profile/:id` with the Bearer token", async () => {
    global.fetch.mockResolvedValue(
      jsonResponse({
        message: "Perfil actualizado correctamente",
        user: { id: 42, rol: "aprendiz" },
      })
    );

    const data = { nombres: "Nuevo", profilePhoto: "data:image/png;base64,BBB" };
    await usersApi.updateProfile(42, data);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe(`${API_URL}/users/profile/42`);
    expect(options.method).toBe("PUT");
    expect(options.headers.Authorization).toBe("Bearer tok-slice4");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.body).toBe(JSON.stringify(data));
  });

  it("resolves the parsed success payload", async () => {
    global.fetch.mockResolvedValue(
      jsonResponse({
        message: "Perfil actualizado correctamente",
        user: { id: 42, rol: "aprendiz" },
      })
    );

    const data = await usersApi.updateProfile(42, { nombres: "Nuevo" });

    expect(data.user.id).toBe(42);
    expect(data.message).toBe("Perfil actualizado correctamente");
  });
});

describe("usersApi.updateProfilePhoto (DESIGN GOTCHA: JSON body, NOT FormData)", () => {
  it("PUTs JSON {profilePhoto} — not FormData — to `${API_URL}/users/profile/:id/photo`", async () => {
    global.fetch.mockResolvedValue(
      jsonResponse({ message: "Foto de perfil actualizada", profile_photo: "data:image/png;base64,CCC" })
    );

    const dataUrl = "data:image/png;base64,CCC";
    await usersApi.updateProfilePhoto(42, dataUrl);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe(`${API_URL}/users/profile/42/photo`);
    expect(options.method).toBe("PUT");
    expect(options.headers.Authorization).toBe("Bearer tok-slice4");
    // JSON string body, NOT FormData (backend destructures req.body.profilePhoto).
    expect(options.body).not.toBeInstanceOf(FormData);
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(options.body)).toEqual({ profilePhoto: dataUrl });
  });

  it("resolves the parsed success payload", async () => {
    global.fetch.mockResolvedValue(
      jsonResponse({ message: "Foto de perfil actualizada", profile_photo: "data:image/png;base64,CCC" })
    );

    const data = await usersApi.updateProfilePhoto(42, "data:image/png;base64,CCC");

    expect(data.message).toBe("Foto de perfil actualizada");
    expect(data.profile_photo).toBe("data:image/png;base64,CCC");
  });
});

describe("usersApi.getProfilePhoto", () => {
  it("GETs `${API_URL}/users/profile/:id/photo` with the Bearer token and resolves {profile_photo}", async () => {
    global.fetch.mockResolvedValue(
      jsonResponse({ profile_photo: "data:image/png;base64,DDD" })
    );

    const data = await usersApi.getProfilePhoto(42);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe(`${API_URL}/users/profile/42/photo`);
    expect(options.method).toBe("GET");
    expect(options.headers.Authorization).toBe("Bearer tok-slice4");
    expect(data.profile_photo).toBe("data:image/png;base64,DDD");
  });
});

describe("usersApi.getPrivacy", () => {
  it("GETs `${API_URL}/users/privacy/:userId` with the Bearer token and resolves {diary_visibility}", async () => {
    global.fetch.mockResolvedValue(jsonResponse({ diary_visibility: "yo-psicologo" }));

    const data = await usersApi.getPrivacy(42);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe(`${API_URL}/users/privacy/42`);
    expect(options.method).toBe("GET");
    expect(options.headers.Authorization).toBe("Bearer tok-slice4");
    expect(data.diary_visibility).toBe("yo-psicologo");
  });
});

describe("usersApi.updatePrivacy", () => {
  it("PUTs JSON {visibilidad} to `${API_URL}/users/privacy/:userId`", async () => {
    global.fetch.mockResolvedValue(
      jsonResponse({ message: "Privacidad actualizada correctamente" })
    );

    await usersApi.updatePrivacy(42, "solo-yo");

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe(`${API_URL}/users/privacy/42`);
    expect(options.method).toBe("PUT");
    expect(options.headers.Authorization).toBe("Bearer tok-slice4");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.body).toBe(JSON.stringify({ visibilidad: "solo-yo" }));
  });

  it("resolves the parsed success payload", async () => {
    global.fetch.mockResolvedValue(
      jsonResponse({ message: "Privacidad actualizada correctamente" })
    );

    const data = await usersApi.updatePrivacy(42, "solo-yo");

    expect(data.message).toBe("Privacidad actualizada correctamente");
  });
});

describe("usersApi protected 401 handling (client defaults preserved)", () => {
  it("clears the session and redirects on 401 for a protected users endpoint", async () => {
    global.fetch.mockResolvedValue(jsonResponse({ message: "Sesión expirada. Inicie sesión nuevamente." }, 401));

    const error = await usersApi.search("1234567890").catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(401);
    expect(error.message).toBe("Sesión expirada");
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    // Redirect to "/" observable via jsdom fragment navigation (hash cleared).
    expect(window.location.pathname).toBe("/");
    expect(window.location.hash).toBe("");
  });
});
