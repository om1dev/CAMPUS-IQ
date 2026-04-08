import { useMemo } from 'react';

/**
 * Derives notification objects from a submissions array.
 * Picks up all log entries that have remarks (rejections + approvals).
 */
export function useNotifications(submissions = []) {
  return useMemo(() => {
    const notes = [];

    for (const sub of submissions) {
      const logs = sub.logs || [];
      for (const log of logs) {
        const isActionable = ['rejected', 'approved_final', 'approved_step'].includes(log.action);
        if (!isActionable && !log.remarks?.trim()) continue;

        const type =
          log.action === 'rejected'       ? 'rejected' :
          log.action === 'approved_final' ? 'approved' :
          log.action === 'approved_step'  ? 'approved' :
          'pending';

        notes.push({
          id:        `${sub.id}-${log.id}`,
          type,
          title:     sub.record?.title || sub.table_name?.replace(/_/g, ' ') || 'Submission',
          submitter: sub.submitter?.full_name || sub.submitter?.email || null,
          remark:    log.remarks?.trim() || null,
          tableName: sub.table_name,
          timestamp: log.created_at,
          actorRole: log.actor_role,
        });
      }
    }

    return notes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [submissions]);
}
