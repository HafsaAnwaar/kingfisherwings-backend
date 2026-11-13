import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Request, Response } from "express";
import { Observable, tap } from "rxjs";
import { TechLogsService } from "./tech-logs.service";
import { clientIp, resolveTechLogActor } from "./tech-logs-actor.util";

/**
 * Records mutating request activity + HTTP error statuses into Tech Logs.
 * Fire-and-forget — never blocks or fails the request.
 */
@Injectable()
export class TechLogsInterceptor implements NestInterceptor {
  constructor(private readonly techLogs: TechLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== "http") return next.handle();

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const started = Date.now();
    const method = (req.method || "GET").toUpperCase();
    const path = req.originalUrl || req.url || "";

    return next.handle().pipe(
      tap({
        next: () => {
          void this.capture(req, res.statusCode, method, path, started, null);
        },
        error: (err: unknown) => {
          const status =
            err &&
            typeof err === "object" &&
            "status" in err &&
            typeof (err as { status?: unknown }).status === "number"
              ? (err as { status: number }).status
              : 500;
          void this.capture(req, status, method, path, started, err);
        },
      }),
    );
  }

  private async capture(
    req: Request,
    statusCode: number,
    method: string,
    path: string,
    started: number,
    err: unknown,
  ) {
    try {
      if (this.techLogs.shouldSkipPath(path)) return;
      const actor = resolveTechLogActor(req as never);
      const durationMs = Date.now() - started;
      const ip = clientIp(req);
      const userAgent =
        typeof req.headers["user-agent"] === "string"
          ? req.headers["user-agent"]
          : null;

      const isError = statusCode >= 400;
      await this.techLogs.recordActivity({
        actor,
        method,
        path,
        statusCode,
        action: `${method} ${path.split("?")[0]}`,
        summary: isError
          ? `${method} ${path.split("?")[0]} → ${statusCode}`
          : `${method} ${path.split("?")[0]}`,
        ip,
        userAgent,
        durationMs,
      });

      if (isError) {
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message?: unknown }).message)
            : `HTTP ${statusCode}`;
        const stack =
          err instanceof Error
            ? err.stack
            : err && typeof err === "object" && "stack" in err
              ? String((err as { stack?: unknown }).stack)
              : null;
        const errorCode =
          err && typeof err === "object" && "response" in err
            ? extractErrorCode((err as { response?: unknown }).response)
            : null;

        await this.techLogs.recordIssue({
          actor,
          source: "API",
          method,
          path,
          statusCode,
          errorCode,
          message,
          stack,
          ip,
          userAgent,
        });
      }
    } catch {
      // never throw from logging
    }
  }
}

function extractErrorCode(response: unknown): string | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  if (typeof r.code === "string") return r.code;
  if (typeof r.error === "string") return r.error;
  return null;
}
