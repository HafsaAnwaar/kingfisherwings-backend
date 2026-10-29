import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  SendWhatsAppDto,
  WhatsAppRecipientType,
} from "./dto/send-whatsapp.dto";
import { WhatsAppService } from "./whatsapp.service";

@Injectable()
export class WhatsAppComposeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsApp: WhatsAppService,
  ) {}

  status() {
    return {
      success: true,
      data: this.whatsApp.getConfigStatus(),
    };
  }

  async send(
    tenantId: string,
    dto: SendWhatsAppDto,
    actorId?: string,
  ) {
    const toPhone = await this.resolvePhone(tenantId, dto);
    const result = await this.whatsApp.send({
      tenantId,
      toPhoneE164: toPhone,
      body: dto.message,
      createdBy: actorId,
    });
    return {
      success: true,
      data: {
        ...result,
        recipient_type: dto.recipient_type,
        recipient_id: dto.recipient_id ?? null,
      },
    };
  }

  private async resolvePhone(
    tenantId: string,
    dto: SendWhatsAppDto,
  ): Promise<string> {
    if (dto.to_phone?.trim()) {
      return dto.to_phone.trim();
    }

    if (dto.recipient_type === WhatsAppRecipientType.RAW) {
      throw new BadRequestException(
        "to_phone is required when recipient_type is RAW.",
      );
    }

    if (!dto.recipient_id) {
      throw new BadRequestException(
        "recipient_id is required for USER / PARTY recipients.",
      );
    }

    if (dto.recipient_type === WhatsAppRecipientType.USER) {
      const user = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.user.findFirst({
          where: {
            id: dto.recipient_id!,
            tenant_id: tenantId,
            deleted_at: null,
          },
          select: {
            whatsapp_number: true,
            phone: true,
            email: true,
          },
        }),
      );
      if (!user) throw new NotFoundException("User not found.");
      const phone = user.whatsapp_number?.trim() || user.phone?.trim();
      if (!phone) {
        throw new BadRequestException(
          `User ${user.email} has no whatsapp_number or phone on file.`,
        );
      }
      return phone;
    }

    // PARTY — customers / vendors
    const party = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.party.findFirst({
        where: {
          id: dto.recipient_id!,
          tenant_id: tenantId,
          deleted_at: null,
        },
        select: {
          phone: true,
          name: true,
          contacts: {
            where: { deleted_at: null, is_primary: true },
            take: 1,
            select: { phone: true, mobile: true },
          },
        },
      }),
    );
    if (!party) throw new NotFoundException("Party not found.");

    const primary = party.contacts[0];
    const phone =
      party.phone?.trim() ||
      primary?.mobile?.trim() ||
      primary?.phone?.trim();
    if (!phone) {
      throw new BadRequestException(
        `Party "${party.name}" has no phone on file.`,
      );
    }
    return phone;
  }
}
