import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

type RepairStatus = 'Reported' | 'Assigned' | 'Repairing' | 'Restored';

type RepairIncident = {
  id: string;
  issue: string;
  asset: string;
  urgency: 'Critical' | 'High' | 'Medium';
  impact: string;
  technician: string;
  status: RepairStatus;
  reported: string;
};

@Component({
  selector: 'app-operative-maintenance',
  imports: [ReactiveFormsModule],
  templateUrl: './operative-maintenance.html',
  styleUrl: './operative-maintenance.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperativeMaintenance {
  private readonly formBuilder = inject(FormBuilder);
  protected readonly technicians = ['Unassigned', 'Narin K.', 'Mali P.', 'Somchai T.'];
  protected readonly incidents = signal<RepairIncident[]>([
    {
      id: 'BR-081',
      issue: 'Hydraulic pressure loss',
      asset: 'Press 02 / Production floor',
      urgency: 'Critical',
      impact: 'Production stopped',
      technician: 'Narin K.',
      status: 'Repairing',
      reported: 'Today, 10:18',
    },
    {
      id: 'BR-080',
      issue: 'Drive motor making unusual noise',
      asset: 'Conveyor 03 / Workshop',
      urgency: 'High',
      impact: 'Reduced capacity',
      technician: 'Mali P.',
      status: 'Assigned',
      reported: 'Today, 08:52',
    },
    {
      id: 'BR-079',
      issue: 'Loading dock sensor failure',
      asset: 'Dock 02 / Warehouse',
      urgency: 'Medium',
      impact: 'Manual operation',
      technician: 'Somchai T.',
      status: 'Restored',
      reported: 'Yesterday, 15:40',
    },
  ]);
  protected readonly repairForm = this.formBuilder.nonNullable.group({
    asset: ['', Validators.required],
    issue: ['', [Validators.required, Validators.maxLength(100)]],
    urgency: ['High' as RepairIncident['urgency'], Validators.required],
    impact: ['Production stopped', Validators.required],
    technician: ['Unassigned', Validators.required],
  });
  protected readonly activeIncidentCount = computed(
    () => this.incidents().filter((incident) => incident.status !== 'Restored').length,
  );

  protected reportIncident(): void {
    if (this.repairForm.invalid) {
      this.repairForm.markAllAsTouched();
      return;
    }

    const value = this.repairForm.getRawValue();
    this.incidents.update((incidents) => [
      {
        id: `BR-${82 + incidents.length}`,
        issue: value.issue,
        asset: value.asset,
        urgency: value.urgency,
        impact: value.impact,
        technician: value.technician,
        status: value.technician === 'Unassigned' ? 'Reported' : 'Assigned',
        reported: 'Just now',
      },
      ...incidents,
    ]);
    this.repairForm.reset({
      asset: '',
      issue: '',
      urgency: 'High',
      impact: 'Production stopped',
      technician: 'Unassigned',
    });
  }

  protected advanceRepair(id: string): void {
    this.incidents.update((incidents) =>
      incidents.map((incident) => ({
        ...incident,
        status: incident.id === id ? this.nextStatus(incident.status) : incident.status,
      })),
    );
  }

  private nextStatus(status: RepairStatus): RepairStatus {
    const nextStatuses: Record<RepairStatus, RepairStatus> = {
      Reported: 'Assigned',
      Assigned: 'Repairing',
      Repairing: 'Restored',
      Restored: 'Restored',
    };
    return nextStatuses[status];
  }
}
