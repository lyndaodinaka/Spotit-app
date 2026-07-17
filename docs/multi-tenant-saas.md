# Spotit Multi-Tenant SaaS Foundation

Spotit now has a SaaS-ready tenant model. One Spotit application can serve many customer organisations from the same web address. After sign-in, the platform identifies the user's organisation and only loads that organisation's workspace.

## What Is Included

- Organisation records for each customer workspace.
- Clinicians linked to one organisation.
- Organisation-scoped patient, wound, photo, assessment, care plan, report, incomplete-assessment, and audit-log records.
- Organisation admin access for managing staff and access requests inside that organisation.
- Platform admin access for the Spotit owner to manage the wider SaaS service.
- Invitations for creating organisation admins and staff without sharing the Spotit owner password.
- Subscription status, plan, seat limit, feature flags, billing records, and usage counts.
- Billing choice for monthly or yearly subscription.
- Manual or automatic subscription preference.
- Payment instructions for bank transfer, SWIFT/international transfer, and invoice.
- Announcement records for sending platform messages.
- Support-access grant records so platform support access can be time-limited, reasoned, and auditable.
- Role and permission fields for staff controls.
- Two-factor authentication readiness fields.
- Configurable automatic session timeout.
- Existing records are migrated into the default `Medholic Digital Health` organisation.

## Example Organisations

- `Medholic Digital Health` - platform owner workspace.
- `Derby Care Home` - customer organisation.
- `Bristol Nursing Home` - customer organisation.
- `NHS Community Team` - customer organisation.

These organisations use the same deployed Spotit application, but their clinical records are isolated by `organisationId`.

## Super Admin Versus Organisation Admin

The Spotit super admin uses `platform_admin`. This account is for platform management:

- create organisations
- suspend or activate subscriptions
- create organisation admin invitations
- reset organisation admin passwords when requested
- view usage statistics
- manage billing records
- send announcements
- enable or disable feature flags

The platform admin should not browse clinical records as routine work. Clinical support should only happen with a legitimate audited support reason and customer agreement.

Organisation admins use `admin`. They can manage their own workspace:

- add staff
- invite new users
- remove or suspend staff
- reset staff passwords
- control permissions
- review audit activity for their organisation

Normal clinical users use `clinician`.

## Railway Variables

Set these variables before running `npm run admin:create`:

- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_ROLE=platform_admin`
- `ADMIN_ORGANISATION_NAME=Medholic Digital Health`
- `ADMIN_ORGANISATION_SLUG=medholic-digital-health`
- `SESSION_TIMEOUT_HOURS=8`
- `BACKUP_POLICY=railway_postgres_managed_backups_enabled`
- `SPOTIT_SMALL_MONTHLY_GBP=800.00`
- `SPOTIT_SMALL_YEARLY_GBP=8800.00`
- `SPOTIT_MEDIUM_MONTHLY_GBP=1500.00`
- `SPOTIT_MEDIUM_YEARLY_GBP=16500.00`
- `SPOTIT_LARGE_MONTHLY_GBP=3000.00`
- `SPOTIT_LARGE_YEARLY_GBP=33000.00`
- `SPOTIT_ENTERPRISE_MONTHLY_GBP=Custom quotation`
- `SPOTIT_ENTERPRISE_YEARLY_GBP=Custom quotation`
- `SPOTIT_BANK_ACCOUNT_NAME`
- `SPOTIT_BANK_SORT_CODE`
- `SPOTIT_BANK_ACCOUNT_NUMBER`
- `SPOTIT_BANK_IBAN`
- `SPOTIT_BANK_BIC`
- `SPOTIT_BANK_REFERENCE_PREFIX=SPOTIT`

Buyer organisations should receive their own admin account. They should not use the Spotit owner email or password.

## Subscription And Payment Model

Spotit supports tiered subscription prices:

- Small clinic: GBP 800 monthly or GBP 8800 yearly.
- Medium organisation: GBP 1500 monthly or GBP 16500 yearly.
- Large / professional multiple teams: GBP 3000 monthly or GBP 33000 yearly.
- Enterprise, large providers, and NHS: custom monthly and yearly quotation.

Each subscription includes:

- Regular wound photos
- Progress tracking
- Secure storage
- Team collaboration
- Reports and analytics
- Technical support
- Regular software updates

Each organisation can choose:

- Manual subscription - the platform owner confirms payment after receiving funds.

Each organisation can choose a payment method:

- Bank transfer
- Invoice

Bank transfer payments create a unique Spotit payment reference and display the configured business account details. Local and international buyers can pay using normal bank transfer, SWIFT/international transfer, or invoice as long as the funds arrive in the configured business account. The platform super admin confirms payment after funds are received.

The platform super admin can confirm a billing record as paid. When confirmed, the organisation subscription becomes active and the billing period is recorded.

## Security Features Now Represented

- Role-based access control through `platform_admin`, `admin`, `clinician`, and permission arrays.
- Tenant isolation through `organisationId` on clinical and operational records.
- Audit logs for platform and organisation actions.
- Configurable session timeout.
- Password reset flags requiring users to change temporary passwords.
- Two-factor authentication readiness fields for future OTP/app authenticator implementation.
- Encrypted-field environment variable already required in production.
- Managed backup policy captured for hosting governance.

## Important Clinical Note

This SaaS foundation separates customer data, but it does not by itself make Spotit clinically approved for live patient use. Each purchasing organisation still needs its own GDPR, DPIA, DPA, information governance, clinical safety, pilot, and local approval process before using real patient data.
