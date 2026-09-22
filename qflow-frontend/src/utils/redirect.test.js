import { describe, it, expect, beforeEach } from "vitest";
import { getSafeRedirect } from "./redirect";

describe("getSafeRedirect", () => {
    beforeEach(() => {
        // Make URL resolution deterministic in tests.
        window.history.pushState({}, "", "/");
    });

    describe("valid internal routes", () => {
        it("accepts a simple internal pathname", () => {
            const result = getSafeRedirect({
                pathname: "/admin"
            });

            expect(result).toBe("/admin");
        });

        it("accepts an internal route with a query string", () => {
            const result = getSafeRedirect({
                pathname: "/admin/queue/42",
                search: "?tab=tickets"
            });

            expect(result).toBe(
                "/admin/queue/42?tab=tickets"
            );
        });

        it("accepts an internal route with a hash", () => {
            const result = getSafeRedirect({
                pathname: "/admin/queue/42",
                hash: "#current-ticket"
            });

            expect(result).toBe(
                "/admin/queue/42#current-ticket"
            );
        });

        it("preserves pathname, query string, and hash", () => {
            const result = getSafeRedirect({
                pathname: "/admin/queue/42",
                search: "?tab=tickets&status=waiting",
                hash: "#current-ticket"
            });

            expect(result).toBe(
                "/admin/queue/42?tab=tickets&status=waiting#current-ticket"
            );
        });

        it("accepts the root route", () => {
            const result = getSafeRedirect({
                pathname: "/"
            });

            expect(result).toBe("/");
        });
    });

    describe("external URLs", () => {
        it("rejects an absolute external URL", () => {
            const result = getSafeRedirect({
                pathname: "https://evil.com"
            });

            expect(result).toBeNull();
        });

        it("rejects an external URL with a path", () => {
            const result = getSafeRedirect({
                pathname: "https://evil.com/login"
            });

            expect(result).toBeNull();
        });
    });

    describe("protocol-relative URLs", () => {
        it("rejects a protocol-relative URL", () => {
            const result = getSafeRedirect({
                pathname: "//evil.com"
            });

            expect(result).toBeNull();
        });

        it("rejects a protocol-relative URL with a path", () => {
            const result = getSafeRedirect({
                pathname: "//evil.com/login"
            });

            expect(result).toBeNull();
        });
    });

    describe("malformed values", () => {
        it("rejects null", () => {
            expect(getSafeRedirect(null)).toBeNull();
        });

        it("rejects undefined", () => {
            expect(getSafeRedirect(undefined)).toBeNull();
        });

        it("rejects a string", () => {
            expect(
                getSafeRedirect("/admin")
            ).toBeNull();
        });

        it("rejects an empty object", () => {
            expect(
                getSafeRedirect({})
            ).toBeNull();
        });

        it("rejects a missing pathname", () => {
            expect(
                getSafeRedirect({
                    search: "?tab=tickets"
                })
            ).toBeNull();
        });

        it("rejects a non-string pathname", () => {
            expect(
                getSafeRedirect({
                    pathname: 123
                })
            ).toBeNull();
        });

        it("rejects an empty pathname", () => {
            expect(
                getSafeRedirect({
                    pathname: ""
                })
            ).toBeNull();
        });
    });

    describe("unsafe schemes", () => {
        it("rejects javascript URLs", () => {
            const result = getSafeRedirect({
                pathname: "javascript:alert(1)"
            });

            expect(result).toBeNull();
        });

        it("rejects data URLs", () => {
            const result = getSafeRedirect({
                pathname: "data:text/html,<h1>XSS</h1>"
            });

            expect(result).toBeNull();
        });
    });
});