"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";


export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  async function handleLogin(
    event: React.FormEvent
  ) {

    event.preventDefault();

    setError("");
    setLoading(true);

    try {

      // ====================================================
      // LOGIN
      // api.login automatically stores JWT token
      // ====================================================

      await api.login(
        email,
        password
      );


      // ====================================================
      // GET CURRENT USER
      // ====================================================

      const user =
        await api.getCurrentUser();


      // ====================================================
      // ROLE BASED REDIRECT
      // ====================================================

      if (user.role === "artisan") {

        router.push("/seller");

      } else if (user.role === "admin") {

        router.push("/admin");

      } else {

        router.push("/");

      }

    } catch (err) {

      console.error(
        "Login failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials."
      );

    } finally {

      setLoading(false);

    }
  }


  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >

      <div
        style={{
          width: "100%",
          maxWidth: "640px",
        }}
      >

        {/* Brand */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "48px",
          }}
        >

          <div
            style={{
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "4px",
              marginBottom: "18px",
            }}
          >
            HASTKATHA
          </div>


          <h1
            style={{
              fontFamily:
                "Georgia, serif",
              fontSize: "56px",
              lineHeight: 1,
              margin: 0,
              marginBottom: "20px",
            }}
          >
            Welcome back
          </h1>


          <p
            style={{
              fontSize: "20px",
              color: "#686860",
              margin: 0,
            }}
          >
            Sign in to continue to
            HASTKATHA.
          </p>

        </div>


        {/* Login Card */}

        <div
          style={{
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "28px",
            padding: "48px",
          }}
        >

          <form
            onSubmit={handleLogin}
          >

            {/* Email */}

            <div
              style={{
                marginBottom: "28px",
              }}
            >

              <label
                htmlFor="email"
                style={{
                  display: "block",
                  fontSize: "18px",
                  fontWeight: 700,
                  marginBottom: "10px",
                }}
              >
                Email
              </label>


              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                required
                autoComplete="email"
                style={{
                  width: "100%",
                  padding: "18px",
                  borderRadius: "14px",
                  border: "1px solid #ccc",
                  fontSize: "17px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />

            </div>


            {/* Password */}

            <div
              style={{
                marginBottom: "28px",
              }}
            >

              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontSize: "18px",
                  fontWeight: 700,
                  marginBottom: "10px",
                }}
              >
                Password
              </label>


              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{
                  width: "100%",
                  padding: "18px",
                  borderRadius: "14px",
                  border: "1px solid #ccc",
                  fontSize: "17px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />

            </div>


            {/* Error */}

            {error && (

              <div
                style={{
                  background: "#fff1ef",
                  border: "1px solid #e7a49a",
                  color: "#a43d2d",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  marginBottom: "22px",
                  fontSize: "14px",
                }}
              >
                {error}
              </div>

            )}


            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "18px",
                borderRadius: "14px",
                border: "none",
                background:
                  loading
                    ? "#7a827b"
                    : "#1d261f",
                color: "#fff",
                fontSize: "17px",
                fontWeight: 700,
                cursor:
                  loading
                    ? "not-allowed"
                    : "pointer",
              }}
            >

              {loading
                ? "Signing in..."
                : "Sign in"}

            </button>

          </form>

        </div>


        {/* Register */}

        <div
          style={{
            textAlign: "center",
            marginTop: "32px",
            fontSize: "17px",
            color: "#686860",
          }}
        >

          Don't have an account?{" "}

          <Link
            href="/register"
            style={{
              fontWeight: 700,
              color: "#1d261f",
              textDecoration: "none",
            }}
          >
            Create account
          </Link>

        </div>

      </div>

    </main>
  );
}