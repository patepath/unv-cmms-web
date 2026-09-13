import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

type MenuItem = {
  label: string;
  icon: 'overview' | 'work-orders' | 'assets' | 'maintenance' | 'operative-maintenance' | 'reports';
  path: string;
};

@Component({
  selector: 'app-default-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './default-layout.html',
  styleUrl: './default-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultLayout {
  protected readonly isSidebarCollapsed = signal(false);
  protected readonly activeMenuItem = signal('ภาพรวม');
  protected readonly menuItems: MenuItem[] = [
    { label: 'ภาพรวม', icon: 'overview', path: 'overview' },
    { label: 'ใบสั่งงาน', icon: 'work-orders', path: 'work-orders' },
    { label: 'ครุภัณฑ์', icon: 'assets', path: 'assets' },
    { label: 'การบำรุงรักษาเชิงป้องกัน (PM)', icon: 'maintenance', path: 'preventive-maintenance', },
    { label: 'การบำรุงรักษาเชิงปฏิบัติ (OM)', icon: 'operative-maintenance', path: 'operative-maintenance', },
    { label: 'รายงาน', icon: 'reports', path: 'reports' },
  ];

  protected toggleSidebar(): void {
    this.isSidebarCollapsed.update((collapsed) => !collapsed);
  }

  protected selectMenuItem(label: string): void {
    this.activeMenuItem.set(label);
  }
}
