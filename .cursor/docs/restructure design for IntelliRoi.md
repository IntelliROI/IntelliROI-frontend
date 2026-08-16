For your example, if the company is **Penguin Technologies** and Rahul is an employee, the system should be able to answer: 

Rahul belongs to Penguin Technologies → Engineering → Frontend Team → works on Invoice Builder → has the role Frontend Developer → has an hourly cost of $30 → uses OpenAI → generates AI usage events. 

That relationship is what eventually allows your analytics and ROI engine to work. 

# **1. Complete company-domain structure** 

I recommend this hierarchy: 

Company 

│ 

├── Company Settings 

│ 

├── Departments 

│      │ 

│      └── Department Manager 

│ 

├── Teams 

│      │ 

│      └── Team Lead 

│ 

├── Employees 

│      │ 

│      └── Job Role 

│ 

├── Projects 

│ 

├── AI Providers 

│      │ 

│      └── AI Models 

│ 

├── AI Policies 

│ 

└── ROI Configuration 

│ 

├── Job Roles 

└── Task Categories / Benchmarks 

But there is an important distinction: 

# **Department, Team, Employee and Project are organization entities.** 

# **Job Role, AI Provider, AI Policy and ROI Configuration are configuration entities.** 

That distinction should exist in your database and backend architecture. 

# **2. Company Registration** 

When Penguin Technologies registers: 

# **Company** 

Company Name: 

Penguin Technologies 

Company Code: 

PENGWIN 

Industry: 

Software / Technology 

Company Size: 

1–50 

Country: India 

Timezone: 

Asia/Kolkata 

Currency: 

USD 

Website: 

https://pengwintech.com The system creates: 

companies 

Example: 

**Field Example** 

company_id 1 

company_name Penguin Technologies 

company_code PENGWIN 

industry Technology company_size 1–50 country India 

# **Field Example** 

timezone Asia/Kolkata currency USD status Active 

The person who registered the company becomes: 

Company Owner / CEO 

# **3. Company Settings** 

Don't put every setting inside companies. 

Create a separate: 

company_settings 

Example: 

company_id 

working_hours_per_day 

working_days_per_month 

default_currency 

timezone 

date_format fiscal_year_start 

For example: 

Penguin Technologies 

Working Hours: 

8 

Working Days: 

22 

Currency: 

USD 

These values later support your ROI calculations. 

# **4. Department Registration** 

CEO selects: 

Organization 

↓ 

Departments 

↓ 

Create Department 

Form: 

Department Name 

Department Code 

Description 

Department Manager 

Status 

Example: 

Department Name: 

Engineering 

Department Code: 

ENG 

Description: 

Software development and engineering 

Department Manager: 

Arun Kumar 

Status: Active Database: departments 

**Field Example** department_id 10 company_id 1 department_name Engineering department_code ENG description Software development manager_employee_id 25 status Active 

# **Relationship** 

Company │ 

└── Engineering 

The company_id is critical because it prevents one company's department from accidentally being visible to another company. 

# **5. Job Role Registration** 

This should be separate from the employee. 

For example: 

Job Roles 

Frontend Developer 

Backend Developer 

QA Engineer 

UI/UX Designer 

Engineering Manager 

Create: 

job_roles 

Example: 

**Field Example** 

role_id 101 

company_id 1 

role_name Frontend Developer hourly_cost 30 

currency USD status Active 

Why separate this? 

Because 20 employees might be: 

Frontend Developer 

You don't want to repeatedly configure $30/hour for every employee. 

Instead: 

Job Role 

Frontend Developer 

│ └── $30/hour 

Then: 

Rahul → Frontend Developer 

John  → Frontend Developer 

David → Frontend Developer 

All inherit the role configuration. 

# **6. Employee Registration** 

Now we come to your important question. 

Suppose CEO/Manager clicks: 

# **Add Employee** 

The form should not just ask for name and email. 

It should capture the employee's organizational identity. 

# **Employee form** 

# **Personal information** 

First Name 

Last Name 

Display Name 

Email 

Phone 

Profile Photo 

# **Organization information** 

Employee ID 

Department 

Team 

Job Role 

Designation 

Manager 

Joining Date 

Employment Status 

# **Access information** 

Username / Email 

Authentication Method Application Role Account Status 

# **Example** 

Employee ID: EMP-0041 

First Name: 

Rahul 

Last Name: 

Kumar 

Email: 

rahul@pengwintech.com 

Department: 

Engineering 

Team: 

Frontend Team 

Job Role: Frontend Developer 

Designation: Software Engineer Manager: Arun Kumar 

Joining Date: 2026-08-01 

Status: Active Database: employees Recommended fields: employee_id company_id user_id employee_code 

first_name last_name 

display_name email phone 

department_id team_id job_role_id manager_employee_id 

designation joining_date employment_status 

status 

created_at updated_at 

# **Important relationship** 

Rahul should ultimately resolve like this: 

Rahul 

│ 

├── Company → Penguin Technologies 

│ 

├── Department → Engineering 

│ 

├── Team → Frontend Team 

│ 

├── Job Role → Frontend Developer 

│ 

├── Manager → Arun Kumar 

│ └── Employee ID → EMP-0041 

This is extremely valuable later. 

# **7. Don't put authentication information directly into employees** 

I recommend separating: 

users 

from: 

employees 

Because an employee is a business entity, while a user is an authentication identity. 

For example: 

users 

│ 

├── user_id ├── email 

├── password_hash / auth_provider 

├── status └── last_login 

employees 

│ 

├── employee_id 

├── user_id 

- ├── company_id 

- ├── department_id 

- ├── team_id 

└── job_role_id 

Relationship: 

User 

↓ 

Employee 

↓ 

Organization 

This gives you flexibility later if you have: 

- CEO accounts 

- Managers 

- Employees 

- External users 

- Service accounts 

# **8. Team Registration** 

A team belongs to a department. 

Example: 

Engineering 

│ 

├── Frontend Team 

├── Backend Team 

└── QA Team Create Team: Team Name Team Code Department Team Lead 

Description Status 

Example: Team Name: Frontend Team 

Team Code: FE 

Department: Engineering 

Team Lead: Rahul Database: teams 

**Field Example** team_id 201 

**Field Example** company_id 1 department_id 10 team_name Frontend Team team_code FE team_lead_employee_id 41 description Frontend development status Active Relationship: Penguin Technologies │ └── Engineering │ └── Frontend Team 

# **9. One important improvement: Employee ↔ Team** 

For your MVP, you can have: 

employees.team_id 

But for the enterprise version, I recommend eventually creating: 

employee_team_memberships 

because an employee might participate in multiple teams/projects. Example: 

Rahul 

Primary Team: 

Frontend 

Project Team: 

Invoice Builder 

Temporary Team: 

AI Research 

Then: 

employee_team_memberships 

could contain: 

employee_id 

team_id 

membership_type 

start_date 

end_date 

is_primary 

This is much more flexible. 

# **10. Project Registration** 

Projects should also have organizational ownership. 

Example: 

Engineering 

│ 

└── Frontend Team 

│ 

└── Invoice Builder 

Project form: 

Project Name Project Code Description 

Department 

Team 

Project Manager 

Start Date 

End Date 

Status 

Example: Project: 

Invoice Builder 

Department: 

Engineering 

Team: 

Frontend Team 

Project Manager: 

Arun Kumar 

Database: 

projects 

Recommended: 

project_id 

company_id 

department_id team_id 

project_name project_code description 

project_manager_id 

start_date 

end_date 

status 

created_at 

updated_at 

# **11. AI Provider Registration** 

This is different from organization registration. 

CEO goes: 

Settings 

↓ 

AI Providers 

↓ 

Add Provider 

Example: Provider: OpenAI 

API Key: 

************** 

Status: Active Database: ai_providers Conceptually: company_id provider credential_reference 

status 

configuration 

# **Do not store raw API keys in normal database columns.** 

Use a secrets manager/encrypted credential storage in the real implementation. 

# **12. AI Model Configuration** 

A provider can have multiple models. 

OpenAI 

│ 

├── Model A 

├── Model B 

└── Model C So maintain: ai_models Example: model_id provider_id model_name display_name input_price output_price context_window 

status 

This later allows your Cost Engine to calculate usage. 

# **13. AI Policy** 

CEO can create company-level policies. 

Example: 

AI Policy 

Policy Name: 

Engineering AI Policy 

Allowed Providers: 

OpenAI Claude 

Allowed Models: Model A Model B 

Maximum Daily Usage: 100,000 tokens 

Status: Active But policies should eventually support scope. Company 

Department Team Project Employee So you can eventually have: Company Policy │ ├── Engineering Policy │ ├── HR Policy │ └── Sales Policy 

# **14. ROI Configuration** 

This is another separate domain. 

# **Company-level configuration** 

Working Hours 

Working Days 

Currency 

# **Job-role configuration** 

Frontend Developer 

$30/hour 

Backend Developer 

$35/hour 

QA Engineer 

$25/hour 

# **Task categories** 

Code Generation 

Debugging 

Documentation 

SQL 

Testing 

Research 

# **Benchmarks** 

Code Generation → 30 minutes 

Debugging → 45 minutes 

Documentation → 20 minutes 

Therefore: 

roi_configurations 

job_roles 

task_categories 

task_benchmarks 

should be treated as related but separate entities. 

# **15. The final company database relationship** 

Conceptually: 



<!-- Start of picture text -->
                         COMPANY<br>                            │<br>       ┌────────────────────┼────────────────────┐<br>       │                    │                    │<br>▼ ▼ ▼<br> Departments             Teams              Employees<br>       │                    │                    │<br>       │                    │                    ├── Job Role<br>       │                    │                    ├── Manager<br>       │                    │                    └── User<br>       │                    │<br>       └──────────────┬─────┘<br>                      │<br>▼<br>                   Projects<br>                      │<br>▼<br>                 AI Requests<br>                      │<br><!-- End of picture text -->

┌───────────┼────────────┐ ▼ ▼ ▼ Provider      Model       Employee │ ▼ Usage Event │ ├── Tokens ├── Cost ├── Business Context └── ROI 

# **16. Example: Rahul's complete journey** 

This is the most important part. 

CEO registers: 

Penguin Technologies 

↓ 

CEO creates: 

Engineering Department 

↓ 

Engineering Manager creates: 

Frontend Team 

↓ 

CEO/HR creates: 

Frontend Developer 

$30/hour 

# ↓ 

Manager creates employee: 

Rahul Kumar 

EMP-0041 

↓ 

Assign: 

Department: 

Engineering 

Team: 

Frontend Team 

Role: 

Frontend Developer 

↓ 

Create project: Invoice Builder 

↓ 

Rahul logs in. 

↓ 

Rahul opens: 

AI Workspace 

↓ 

Selects: 

Project: 

Invoice Builder 

Task: 

Code Generation 

Provider: OpenAI 

Model: GPT model ↓ Sends prompt. ↓ Your Gateway records: Employee: EMP-0041 

Company: Penguin Technologies 

Department: Engineering 

Team: 

Frontend Team 

Project: 

Invoice Builder 

Task: Code Generation 

Provider: OpenAI 

Model: 

GPT model ↓ Provider returns: Input Tokens Output Tokens Total Tokens 

↓ 

Cost Engine: AI Cost = $0.40 

↓ 

ROI Engine looks up: Rahul 

↓ 

Frontend Developer 

↓ 

$30/hour 

and: 

Code Generation 

↓ 

30 minutes estimated saving 

↓ 

Business value: 

0.5 × $30 = $15 

↓ 

ROI: 

($15 - $0.40) / $0.40 × 100 

↓ 

Now the CEO can see: 

Penguin Technologies 

│ └── Engineering │ └── Frontend │ └── Rahul │ ├── AI Requests ├── Tokens ├── AI Cost ├── Time Saved ├── Business Value └── Estimated ROI 

# **That is the core data model your entire product is built around.** 

The most important rule is: **every AI request must be traceable back to company → department → team → employee → project → task category.** Once that chain exists, your token analytics, cost analytics, organizational dashboards, and estimated ROI can all be derived from the same underlying usage event. 

