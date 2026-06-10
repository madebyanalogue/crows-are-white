<template>
  <div class="page-section max-w-3xl">
    <PageHeader
      title="Host a Screening"
      subtitle="Community and institutional screenings. Submissions to bookings@crowsarewhite.com"
    />

    <form class="surface-card space-y-10" @submit.prevent>
      <div class="grid gap-6 sm:grid-cols-2">
        <div>
          <label class="label-caps mb-2 block">First name *</label>
          <input required class="input-wire" />
        </div>
        <div>
          <label class="label-caps mb-2 block">Last name *</label>
          <input required class="input-wire" />
        </div>
        <div>
          <label class="label-caps mb-2 block">Email *</label>
          <input type="email" required class="input-wire" />
        </div>
        <div>
          <label class="label-caps mb-2 block">Organization name *</label>
          <input required class="input-wire" />
        </div>
        <div>
          <label class="label-caps mb-2 block">Organization type *</label>
          <select required class="input-wire">
            <option value="">Select type</option>
            <option>College / University</option>
            <option>Buddhist or Meditation Center</option>
            <option>Interfaith or Religious Organization</option>
            <option>Cultural Institution</option>
            <option>Community Cinema</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label class="label-caps mb-2 block">Expected audience size *</label>
          <select required class="input-wire">
            <option value="">Select size</option>
            <option>Under 25</option>
            <option>25–50</option>
            <option>50–100</option>
            <option>100–250</option>
            <option>250+</option>
          </select>
        </div>
        <div>
          <label class="label-caps mb-2 block">City *</label>
          <input required class="input-wire" />
        </div>
        <div>
          <label class="label-caps mb-2 block">State *</label>
          <input required class="input-wire" />
        </div>
      </div>

      <hr class="border-t-2 border-wire-border" />

      <div>
        <p class="label-caps mb-5">Optional</p>
        <div class="space-y-5">
          <div>
            <label class="mb-2 block text-sm text-wire-muted">Preferred date or date range</label>
            <input placeholder="e.g. Fall 2026 or March 15–30" class="input-wire" />
          </div>
          <div>
            <label class="mb-2 block text-sm text-wire-muted">How did you hear about the film?</label>
            <input class="input-wire" />
          </div>
          <div>
            <label class="mb-2 block text-sm text-wire-muted">Anything else (3 lines max)</label>
            <textarea rows="3" class="input-wire resize-y" />
          </div>
        </div>
      </div>

      <button type="submit" class="btn-primary">Submit Screening Request</button>
    </form>
  </div>
</template>
