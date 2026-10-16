import { AuditView } from '../../../components/views/AuditView';
import { PermissionGuard } from '../../../components/auth/PermissionGuard';

export default function DashboardAuditPage() {
  return (
    <PermissionGuard
      requiredPermission="audit:read"
      scopeTitle="Compliance & PII Scrubbing Audit Ledger"
    >
      <AuditView />
    </PermissionGuard>
  );
}
