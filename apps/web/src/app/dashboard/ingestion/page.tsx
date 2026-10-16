import { IngestionView } from '../../../components/views/IngestionView';
import { PermissionGuard } from '../../../components/auth/PermissionGuard';

export default function DashboardIngestionPage() {
  return (
    <PermissionGuard
      requiredPermission="documents:write"
      scopeTitle="Document Ingestion & RLS Partitioning Pipeline"
    >
      <IngestionView />
    </PermissionGuard>
  );
}
