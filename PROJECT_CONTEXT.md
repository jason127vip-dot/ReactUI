# Sales Management System — Project Context

Updated: 2026-09-30 (Pacific/Auckland)

## 1. Project scope

This is an English-language sales management internship project for Brunton ERP. The current V1 covers the process:

`Customer / Product -> Sales Order -> Sales Outbound -> Sales Invoice -> Payment -> Payment Report`

Use the term **Sales Outbound** for inventory leaving the business. Do not rename it to Sales Delivery. Keep **Payments** as the payment module name.

## 2. Workspaces and repositories

### Frontend

- Workspace: `C:\Work\Workspace\ReactUI\react-admin-dashboard`
- Repository: `https://github.com/jason127vip-dot/ReactUI.git`
- Branch: `main`
- Stack: React 19, TypeScript 6, Vite 8, Ant Design 6, React Router, Zustand, Axios
- Latest commit at the time of this document: `e401450 修改首页`

### Backend

- Workspace: `C:\Work\Workspace\Gosales`
- Repository: `https://github.com/jason127vip-dot/Go-Sales.git`
- Branch: `main`
- Stack: Go, Gin, GORM, PostgreSQL
- Latest commit at the time of this document: `bcef0f8 修改首页`
- The backend service is currently stopped. Do not leave it running unless the user asks to start it.

### Reference project

- Reference only: `C:\Work\Workspace\TestGo\SelfTest`
- Do not modify this directory.
- The user wants future Go code to follow its layered directory style. The current backend uses: `config`, `dto`, `handler`, `middleware`, `model`, `repository`, `response`, `router`, and `service`.

Both active repositories were clean before this context document was added. The context document itself may appear as a new uncommitted frontend file.

## 3. Completed frontend features

### Branches (2026-10-06)

- Header branch selector remembers the selected branch in local storage. Switching remounts the content to discard open document forms and refresh data.
- Master Data / Branches supports creating and editing branch codes and names. Branch deletion is not offered.
- Customer and product masters remain shared. Orders belong to a branch; outbounds, invoices, and payments inherit branch ownership through their sales order.
- Sales lists, source selection, payment reports, and Dashboard are scoped to the selected branch. Backend document mutations validate order ownership.
- Business API requests require `X-Branch-ID`; branch and shared-master endpoints do not.
- On the next backend start, AutoMigrate creates the default Main Branch and assigns existing orders to branch ID 1. No database migration or backend start was performed for this change.
- Price lists remain a separate future step.
- New document numbers include the branch code and use a separate yearly sequence per branch, for example `SO-AKL-2026-0001`, `OUT-AKL-2026-0001`, `INV-AKL-2026-0001`, and `PAY-AKL-2026-0001`. Existing document numbers are retained.
- Branch codes are normalized to uppercase letters/numbers, limited to 20 characters, and cannot be changed after the branch has sales orders.

### Credit control (2026-10-06)

- Each branch has an enable switch and total credit limit. Customer allocations for the branch cannot exceed that total.
- Master Data / Credit Control shows every shared customer with that branch's credit limit, confirmed-order exposure, available credit, and status.
- Used credit is the branch/customer's confirmed sales order total minus confirmed payments, floored at zero. The same customer is calculated independently in each branch.
- Saving or editing a draft never reserves credit. An over-limit draft is saved with a warning.
- Confirming a sales order rechecks available credit inside a transaction. It locks the branch and branch/customer credit rows so concurrent confirmations in the same branch cannot consume the same availability.
- Cancelling order confirmation releases exposure. Confirmed payments reduce exposure; cancelling payment confirmation restores it and may leave the customer exceeded, but does not block the accounting correction.
- When credit control is disabled, usage is still calculated but sales order confirmation is not blocked.
- The next backend start uses AutoMigrate to add branch credit fields and create `branch_customer_credits`. This change did not start the backend or migrate the application database.

### Application shell and branding

- Header title: **Sales Management System (Brunton ERP)**.
- Responsive fixed header and collapsible sidebar.
- Light/dark and compact/loose theme controls.
- GitHub icon from the original template was removed.
- Original React Admin Dashboard footer branding was removed.
- Brunton partner image is stored at `public/brunton-partners.png`.
- The partner image appears below the login form and in the application footer.
- Footer contains **Developed by Jin** at the lower right on desktop and below the logo on mobile.
- Login card is 600 px wide on desktop and responsive on small screens.
- Login heading is **Sales Management System**; the old “Login / Welcome back…” heading was removed.

### Authentication

- Protected routes are enabled.
- Demo authentication remains browser-based and uses local storage.
- Demo users and quick-login buttons are available when mock mode is enabled.
- The Go backend does not currently implement authentication endpoints.

### Customer master

- Customer list with keyword and status filters.
- Create, view, edit, and delete.
- Fields include customer code, name, contact person, phone, email, address, payment terms, and status.
- Frontend is connected to the Go API and PostgreSQL.

### Product master

- Product list with keyword and status filters.
- Create, view, edit, and delete.
- Fields include product code, barcode, name, specification, unit, unit price, and status.
- Frontend is connected to the Go API and PostgreSQL.

### Sales Orders

- List columns include order number, customer, order date, total quantity, total amount, document status, outbound status, payment status, paid/unpaid amounts, and actions.
- Search by order number, customer, customer PO number, or salesperson.
- Filter by confirmation status and date range.
- Create and edit draft orders.
- Order header fields include customer, order date, customer PO number, expected outbound date, salesperson, and remarks.
- Add products in either of two ways:
  - scan a barcode or enter a product code and press Enter;
  - manually search and select a product.
- Repeated scanning/entry increases the existing line quantity.
- Order lines calculate quantity, unit price, line amount, and total amount.
- View order details.
- Confirm a draft order, cancel confirmation, and delete a draft order.
- Confirmed orders show an **Execution** drawer with all related outbound lines and payment records, including multiple outbounds/payments.
- Table widths were adjusted to avoid unnecessary horizontal scrolling on normal desktop widths.

### Sales Outbound

- Create an outbound document from a confirmed sales order.
- Only remaining quantities can be outbound; multiple partial outbounds are supported.
- Outbound quantities are validated against the remaining order quantity.
- Search by outbound number, sales order, or customer.
- Filter by confirmation status and date range.
- View details, edit draft, confirm, cancel confirmation, and delete draft.
- Confirmation consumes the order's available quantity; cancelling confirmation releases it.

### Sales Invoice

- Route: `/sales/sales-invoices`; English business UI.
- One full invoice per confirmed Sales Outbound; a unique outbound reference prevents duplicate invoices, including drafts.
- List/search/status/date filters, create, edit date/remarks in draft, view, confirm, cancel confirmation, delete draft.
- Browser printing / Save as PDF with A4 layout and an explicit draft label.
- Quantity comes from the outbound; price comes from the sales order. No new tax or discount fields.
- Customer name/address/PO/payment terms and product details are snapshotted at creation.
- Line amounts are rounded to two decimals; total is the sum of rounded lines.
- Outbounds with any invoice cannot have confirmation cancelled. Invoices with any payment record cannot have confirmation cancelled; reverse confirmed payments and delete their drafts first.
- Order Execution includes invoices and payment invoice numbers.

### Payments

- New payments require a confirmed sales invoice with an unpaid balance. The backend derives the sales order from the invoice for existing order reports.
- The form shows invoice amount, paid amount, and unpaid amount.
- Default payment amount is the current unpaid amount and cannot exceed it.
- Payment methods: Bank Transfer, Cash, Card, and Cheque.
- Optional reference number is supported.
- Search by payment number, invoice, sales order, customer, or reference number.
- Filter by payment method, confirmation status, and date range.
- Edit draft, confirm, cancel confirmation, and delete draft.
- Confirmed payments contribute to paid/unpaid calculations; cancelling confirmation releases the amount.

### Sales Order Payment Report

- Shows every confirmed sales order, including fully paid, partially paid, and unpaid orders.
- Columns include order number, customer, order date, order amount, paid amount, unpaid amount, last payment date, and payment status.
- Search by order number or customer.
- Multi-select payment-status filter.

### Dashboard

- Redesigned as **Sales Overview**.
- KPI cards:
  - Total Sales from confirmed sales orders;
  - Received Amount from confirmed payments;
  - Unpaid Amount;
  - confirmed Outbound Quantity.
- **Daily Order Volume** line/area chart for the last 14 calendar days; zero-order dates are included.
- Recent Sales Orders are shown in a structured table.
- Outstanding Customers are sorted by unpaid amount from highest to lowest.
- Responsive KPI layout and compact lower tables.
- Dashboard refreshes automatically every five minutes and also has a Refresh button.

## 4. Completed backend features

The backend uses PostgreSQL and automatically runs GORM `AutoMigrate` when `go run .` starts. No manual SQL migration is currently needed.

Auto-migrated tables/models:

- `customers`
- `products`
- `sales_orders`
- `sales_order_lines`
- `sales_outbounds`
- `sales_outbound_lines`
- `sales_invoices`
- `sales_invoice_lines`
- `payments` (nullable `sales_invoice_id` preserves existing order-only records)

Main API routes:

- `GET /health`
- `GET /api/dashboard`
- `GET /api/reports/sales-order-payments`
- `GET|POST /api/customers`
- `PUT|DELETE /api/customers/:id`
- `GET|POST /api/products`
- `PUT|DELETE /api/products/:id`
- `GET|POST /api/sales-orders`
- `PUT|DELETE /api/sales-orders/:id`
- `POST /api/sales-orders/:id/confirm`
- `POST /api/sales-orders/:id/cancel-confirmation`
- `GET /api/sales-orders/:id/execution`
- `GET|POST /api/sales-outbounds`
- `PUT|DELETE /api/sales-outbounds/:id`
- `GET /api/sales-outbounds/available-orders`
- `GET /api/sales-outbounds/order/:id/lines`
- `POST /api/sales-outbounds/:id/confirm`
- `POST /api/sales-outbounds/:id/cancel-confirmation`
- `GET|POST /api/payments`
- `PUT|DELETE /api/payments/:id`
- `GET /api/payments/invoice-summaries`
- `GET|POST /api/sales-invoices`
- `GET /api/sales-invoices/available-outbounds`
- `PUT|DELETE /api/sales-invoices/:id`
- `POST /api/sales-invoices/:id/confirm`
- `POST /api/sales-invoices/:id/cancel-confirmation`
- `POST /api/payments/:id/confirm`
- `POST /api/payments/:id/cancel-confirmation`

Document numbers are generated by the backend, for example `SO-2026-0001`, `OUT-2026-0001`, `INV-2026-0001`, and `PAY-2026-0001`.

Business rules already enforced by the backend:

- Only draft documents can be edited or deleted.
- Only confirmed orders can be outbound; confirmed outbounds can be invoiced; confirmed invoices can receive new payments.
- Confirmed outbound quantity cannot exceed remaining order quantity.
- Confirmed payment amount cannot exceed the unpaid invoice amount. Confirmation uses a transaction and order row lock so competing payments cannot consume the same balance.
- Order confirmation cannot be cancelled while dependent outbounds, invoices, or payments exist.
- Only confirmed outbound/payment documents affect execution totals.

## 5. Running locally and on the LAN

### Frontend

From `C:\Work\Workspace\ReactUI\react-admin-dashboard`:

```powershell
npm run dev
```

Vite is configured with `--host`, so the frontend can be opened from another device on the same LAN at:

`http://<computer-ip>:5173`

### Backend

From `C:\Work\Workspace\Gosales`:

```powershell
go run .
```

The backend reads `DATABASE_URL` and optional `SERVER_PORT` from `.env`. The `.env` file is ignored by Git and must never be committed or printed because it contains the database connection string. The default backend port is `8080`.

The frontend API client defaults to:

`http://${window.location.hostname}:8080/api`

This lets localhost and LAN visitors call the backend on the same host automatically. `VITE_API_BASE_URL` can override it.

The currently allowed frontend origins in the Go CORS middleware are:

- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `http://192.168.69.51:5173`

The current LAN IP may change. If it changes, update `C:\Work\Workspace\Gosales\middleware\cors.go` or make the allowed origins configurable.

GitHub can store the source and GitHub Pages can host the static frontend, but the Go API and PostgreSQL access still require a running server or a cloud deployment.

## 6. Validation commands

Frontend:

```powershell
npm run lint
npm run build
git diff --check
```

Backend:

```powershell
gofmt -w repository\sales_document_repository.go
go build ./...
go vet ./...
git diff --check
```

At the end of the last work session, frontend lint/build and backend build/vet passed.

## 7. Discussed but not implemented

- Cloud deployment has not been implemented.
- Production authentication, user/role management, audit logs, inventory stock ledger, returns, and credit notes are not part of the current V1.

## 8. Instructions for continuing work

- Keep all visible business UI text in English unless the user requests otherwise.
- Keep changes focused and follow the existing React and Go project structures.
- Do not modify `C:\Work\Workspace\TestGo\SelfTest`.
- Do not start or leave the Go service running without the user's request.
- Run the frontend and backend validation commands after code changes.
- Read the workspace `AGENTS.md` before editing the frontend.

## 9. Sales Invoice rollout and validation (2026-09-30)

- Invoice management, printing, and invoice-linked payments are now implemented in source. No Go server or application database migration was run during this change.
- The next user-authorized backend start runs AutoMigrate to create invoice tables and the nullable payment invoice reference. Existing payments are preserved and are never automatically assigned to an invoice.
- Legacy order-only payments remain visible with a label and still contribute to order reports/Dashboard. To allocate them: cancel confirmation, edit the draft and choose a confirmed invoice from the same order, then confirm again. All confirmed legacy payments for the order must be reversed/assigned before invoice payment confirmation is allowed.
- If a legacy payment spans several invoices, reverse it and replace its draft with separate payments per invoice; do not simply reduce its amount and lose the remainder.
- The existing Sales Order Payment Report and Dashboard keep their order-based totals. Invoice balances are displayed separately in Sales Invoice. They can differ while orders are not fully invoiced or legacy payments are not yet allocated.
- Old order-only payment payloads and the old payment order-summaries endpoint are no longer accepted by the live API; frontend and backend must be updated together.
- Invoice/payment numbering uses a transaction advisory lock and maximum existing number, avoiding count-based collisions after deletion.
- Tests cover invoice source quantities, snapshots, rounding, invalid payment values, request validation, and business-error responses. Database lifecycle and concurrency still need integration verification after an authorized backend start.

- Validation completed: frontend lint and production build, Go build/vet/unit tests, and whitespace checks. Browser checks verified the invoice route, source-load error state and sample invoice detail. The native print dialog and database-backed end-to-end flow were not verified.

## 12. Branch sales price lists (2026-10-06)

- Sales prices are maintained under Master Data > Sales Price Lists and belong to the branch selected in the header.
- A price is matched by branch, customer, product, and the sales order date. Start and end dates are inclusive.
- Date ranges for the same branch/customer/product cannot overlap. If no matching row exists, the product master unit price is used.
- Selecting a product loads its effective price. Changing the order customer or order date refreshes prices for the current lines. Unit prices remain editable and the saved order line keeps the final price as a historical snapshot.
- API endpoints: `GET/POST /api/price-lists`, `PUT/DELETE /api/price-lists/:id`, and `GET /api/price-lists/resolve?customerId=...&productId=...&date=YYYY-MM-DD`.
- The next backend start runs AutoMigrate to create `price_lists`. Database-backed end-to-end validation has not yet been run.
