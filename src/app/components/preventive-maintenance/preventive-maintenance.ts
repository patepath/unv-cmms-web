import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

type PlanStatus = 'Scheduled' | 'Due soon' | 'Overdue';

type MaintenancePlan = {
  id: string;
  task: string;
  asset: string;
  cadence: string;
  assignee: string;
  nextService: string;
  status: PlanStatus;
};

@Component({
  selector: 'app-preventive-maintenance',
  imports: [ReactiveFormsModule],
  templateUrl: './preventive-maintenance.html',
  styleUrl: './preventive-maintenance.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreventiveMaintenance {
  private readonly formBuilder = inject(FormBuilder);
  protected readonly cadences = ['Weekly', 'Every 2 weeks', 'Monthly', 'Quarterly', 'Annually'];
  protected readonly technicians = ['Unassigned', 'Narin K.', 'Mali P.', 'Somchai T.'];
  protected readonly plans = signal<MaintenancePlan[]>([
    {
      id: 'PM-024',
      task: 'Inspect cooling system filters',
      asset: 'HVAC / Building A',
      cadence: 'Monthly',
      assignee: 'Narin K.',
      nextService: '18 Sep 2026',
      status: 'Due soon',
    },
    {
      id: 'PM-023',
      task: 'Lubricate conveyor bearings',
      asset: 'Line 03 / Workshop',
      cadence: 'Every 2 weeks',
      assignee: 'Mali P.',
      nextService: '25 Sep 2026',
      status: 'Scheduled',
    },
    {
      id: 'PM-022',
      task: 'Test emergency stop controls',
      asset: 'Production floor',
      cadence: 'Quarterly',
      assignee: 'Somchai T.',
      nextService: '02 Sep 2026',
      status: 'Overdue',
    },
  ]);
  protected readonly planForm = this.formBuilder.nonNullable.group({
    task: ['', [Validators.required, Validators.maxLength(80)]],
    asset: ['', Validators.required],
    cadence: ['Monthly', Validators.required],
    nextService: ['', Validators.required],
    assignee: ['Unassigned', Validators.required],
  });
  protected readonly upcomingCount = computed(
    () => this.plans().filter((plan) => plan.status !== 'Overdue').length,
  );

  protected createPlan(): void {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    const value = this.planForm.getRawValue();
    this.plans.update((plans) => [
      {
        id: `PM-${25 + plans.length}`.padStart(6, '0'),
        task: value.task,
        asset: value.asset,
        cadence: value.cadence,
        assignee: value.assignee,
        nextService: this.formatDate(value.nextService),
        status: 'Scheduled',
      },
      ...plans,
    ]);
    this.planForm.reset({
      task: '',
      asset: '',
      cadence: 'Monthly',
      nextService: '',
      assignee: 'Unassigned',
    });
  }

  private formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${date}T00:00:00`));
  }
}
