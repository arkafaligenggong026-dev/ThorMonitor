import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL, STATUS_BADGE_CLASS, URGENSI_LABEL, URGENSI_COLOR } from "@/lib/constants";
import type { Urgensi, WoStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: WoStatus; className?: string }) {
  return (
    <Badge className={cn(STATUS_BADGE_CLASS[status], className)}>{STATUS_LABEL[status]}</Badge>
  );
}

export function UrgensiBadge({ urgensi, className }: { urgensi: Urgensi; className?: string }) {
  return (
    <Badge className={cn(URGENSI_COLOR[urgensi], className)}>{URGENSI_LABEL[urgensi]}</Badge>
  );
}
