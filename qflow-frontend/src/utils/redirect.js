export function getSafeRedirect(from) {
    if (!from || typeof from !== "object") {
        return null;
    }

    const pathname = from.pathname;

    if (
        typeof pathname !== "string" ||
        !pathname.startsWith("/") ||
        pathname.startsWith("//")
    ) {
        return null;
    }

    // Prevent javascript:, data:, etc. from being smuggled
    // through malformed pathname values.
    try {
        const url = new URL(
            `${pathname}${from.search || ""}${from.hash || ""}`,
            window.location.origin
        );

        // Must remain on our own origin.
        if (url.origin !== window.location.origin) {
            return null;
        }

        return (
            url.pathname +
            url.search +
            url.hash
        );
    } catch {
        return null;
    }
}