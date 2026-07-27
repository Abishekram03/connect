from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth.hashers import make_password

from accounts.models import Organization, User
from conversations.models import Conversation, Message


ORGS = {
    "syft": {
        "name": "Syft Technologies",
        "slug": "syft",
        "plan": "pro",
    },
    "acme": {
        "name": "Acme Corp",
        "slug": "acme-corp",
        "plan": "starter",
    },
    "blueline": {
        "name": "BlueLine Logistics",
        "slug": "blueline",
        "plan": "free",
    },
}

AGENTS = [
    {
        "email": "sarah@syft.com",
        "password": "sarah1234",
        "first_name": "Sarah",
        "last_name": "Chen",
        "role": "admin",
        "org": "syft",
    },
    {
        "email": "marcus@syft.com",
        "password": "marcus1234",
        "first_name": "Marcus",
        "last_name": "Johnson",
        "role": "agent",
        "org": "syft",
    },
    {
        "email": "priya@syft.com",
        "password": "priya1234",
        "first_name": "Priya",
        "last_name": "Patel",
        "role": "agent",
        "org": "syft",
    },
    {
        "email": "ops@acme.com",
        "password": "acme1234",
        "first_name": "Tony",
        "last_name": "Stark",
        "role": "admin",
        "org": "acme-corp",
    },
    {
        "email": "help@blueline.com",
        "password": "blueline1234",
        "first_name": "Natasha",
        "last_name": "Romanoff",
        "role": "agent",
        "org": "blueline",
    },
]

CONVERSATIONS = [
    {
        "org": "syft",
        "status": "open",
        "priority": "high",
        "channel": "widget",
        "subject": "Invoice #INV-4021 is incorrect — charged twice",
        "customer_name": "Alex Thompson",
        "customer_email": "alex.thompson@gmail.com",
        "location": "Chicago, IL",
        "live": True,
        "browser": {"os": "macOS 14.5", "browser": "Chrome 126", "screen": "2560x1600"},
        "assignee": "sarah@syft.com",
        "messages": [
            {"body": "Hi, I just noticed I was charged twice for my subscription this month. Invoice #INV-4021 shows $99 but there's a second charge of $99 on my statement. Can you help?", "is_from_customer": True, "sender_email": None},
            {"body": "Hi Alex, I'm sorry about that! Let me look into your account and get this sorted out. I can see both charges — I'll initiate a refund for the duplicate right away.", "is_from_customer": False, "sender_email": "sarah@syft.com"},
            {"body": "Thank you Sarah! How long does the refund usually take to show up?", "is_from_customer": True, "sender_email": None},
            {"body": "It typically takes 5-7 business days to appear on your statement. You'll receive a confirmation email once it's processed. I've also added a 20% credit to your account for the inconvenience.", "is_from_customer": False, "sender_email": "sarah@syft.com"},
            {"body": "That's really great support, thank you! I'll keep an eye out for the confirmation.", "is_from_customer": True, "sender_email": None},
        ],
    },
    {
        "org": "syft",
        "status": "open",
        "priority": "normal",
        "channel": "widget",
        "subject": "Shopify integration setup help",
        "customer_name": "Maria Garcia",
        "customer_email": "maria.garcia@tiendamx.com",
        "location": "Mexico City, MX",
        "browser": {"os": "Windows 11", "browser": "Firefox 128", "screen": "1920x1080"},
        "assignee": None,
        "messages": [
            {"body": "Hola! We're trying to set up the Shopify integration but the products aren't syncing. I followed the docs but nothing appears in the catalog after connecting. Any ideas?", "is_from_customer": True, "sender_email": None},
            {"body": "Hi Maria! Let me check on this. Did you make sure to select the right product collections in the integration settings? Sometimes the default filter excludes certain product types.", "is_from_customer": False, "sender_email": "marcus@syft.com"},
            {"body": "Oh, I didn't realize there was a filter! Let me check and get back to you. Gracias!", "is_from_customer": True, "sender_email": None},
        ],
    },
    {
        "org": "syft",
        "status": "pending",
        "priority": "normal",
        "channel": "widget",
        "subject": "API rate limit question",
        "customer_name": "James Wilson",
        "customer_email": "james.wilson@buildwith.io",
        "location": "San Francisco, CA",
        "browser": {"os": "macOS 14.4", "browser": "Safari 17.5", "screen": "3024x1964"},
        "assignee": "marcus@syft.com",
        "messages": [
            {"body": "We're building an integration and hitting the 100 req/min rate limit pretty quickly during batch operations. Is there a way to get a higher limit on the Pro plan?", "is_from_customer": True, "sender_email": None},
            {"body": "Hey James! Great question. On the Pro plan, the rate limit is actually 300 req/min — but it's applied per-endpoint, not globally. Which endpoint are you hitting? You might be able to optimize by batching more requests.", "is_from_customer": False, "sender_email": "marcus@syft.com"},
            {"body": "Ah, it's the /conversations endpoint. We're polling it every few seconds for each of our 50 users. Maybe we should use webhooks instead?", "is_from_customer": True, "sender_email": None},
            {"body": "Exactly! Webhooks are the way to go for real-time updates. Let me send you our webhooks guide — it'll eliminate the need for polling entirely. I'll also bump your endpoint limit to 500 req/min temporarily while you migrate.", "is_from_customer": False, "sender_email": "marcus@syft.com"},
        ],
    },
    {
        "org": "syft",
        "status": "closed",
        "priority": "low",
        "channel": "email",
        "subject": "Pricing inquiry — annual plan discounts",
        "customer_name": "Emily Zhang",
        "customer_email": "emily.zhang@northwest.tech",
        "location": "Seattle, WA",
        "browser": {},
        "assignee": "priya@syft.com",
        "messages": [
            {"body": "Hi team, we're a 15-person support team evaluating Connect. Do you offer annual pricing discounts? We're comparing with Intercom and would love to know if there's a volume discount for 15+ seats.", "is_from_customer": True, "sender_email": None},
            {"body": "Hi Emily! Thanks for considering Connect! Yes, we offer 20% off on annual plans, and for 15+ seats there's an additional volume tier. I'd love to set up a quick call to walk through the pricing. Are you free this Thursday?", "is_from_customer": False, "sender_email": "priya@syft.com"},
            {"body": "Thursday works! How about 2 PM PST? Could you also share a comparison sheet vs Intercom?", "is_from_customer": True, "sender_email": None},
            {"body": "2 PM PST is perfect! I'll send a calendar invite and a detailed comparison doc ahead of the call. Looking forward to it!", "is_from_customer": False, "sender_email": "priya@syft.com"},
            {"body": "Just following up — thanks for the call today Emily! I've shared the custom proposal in your email. Let me know if you have any questions.", "is_from_customer": False, "sender_email": "priya@syft.com"},
        ],
    },
    {
        "org": "syft",
        "status": "open",
        "priority": "urgent",
        "channel": "whatsapp",
        "subject": "Account locked — can't log in",
        "customer_name": "David Kim",
        "customer_email": "david.kim@meridian-finance.com",
        "location": "New York, NY",
        "live": True,
        "browser": {"os": "Windows 11", "browser": "Edge 127", "screen": "3440x1440"},
        "assignee": "sarah@syft.com",
        "messages": [
            {"body": "URGENT: I've been locked out of my account for the past hour. I tried resetting my password but the reset email isn't coming through. This is blocking our support team from responding to customers. Please help ASAP!", "is_from_customer": True, "sender_email": None},
            {"body": "Hi David, I see the issue — our email provider had a brief outage that affected password reset emails. Let me manually reset your account and send you a temporary link. One moment.", "is_from_customer": False, "sender_email": "sarah@syft.com"},
            {"body": "I've reset your password. Please check your email for the temporary login link. Let me know once you're in!", "is_from_customer": False, "sender_email": "sarah@syft.com"},
            {"body": "Got the email, logging in now. That worked — I'm back in! Thank you for the quick response Sarah. That was a lifesaver.", "is_from_customer": True, "sender_email": None},
        ],
    },
    {
        "org": "syft",
        "status": "pending",
        "priority": "normal",
        "channel": "widget",
        "subject": "Multi-language support for French & German",
        "customer_name": "Sarah Mitchell",
        "customer_email": "sarah.mitchell@voxpopuli.com",
        "location": "London, UK",
        "browser": {"os": "macOS 14.5", "browser": "Chrome 127", "screen": "2880x1800"},
        "assignee": "marcus@syft.com",
        "messages": [
            {"body": "Hi! We're expanding into French and German markets and need our support chatbot to handle both languages. Does Connect auto-detect the language or do we need separate bot flows per language?", "is_from_customer": True, "sender_email": None},
            {"body": "Great timing Sarah! We just rolled out auto-language detection last month. The bot will detect the customer's language from their first message and respond in the same language. No separate flows needed. Want me to enable it for your workspace?", "is_from_customer": False, "sender_email": "marcus@syft.com"},
            {"body": "That sounds perfect! Yes please, enable it. Also, can we add custom translations for some of the bot replies? We have specific brand voice guidelines.", "is_from_customer": True, "sender_email": None},
        ],
    },
    {
        "org": "syft",
        "status": "open",
        "priority": "high",
        "channel": "widget",
        "subject": "Shipping carrier integration — ShipStation webhook failing",
        "customer_name": "Carlos Rivera",
        "customer_email": "crivera@cargorapid.com",
        "location": "Miami, FL",
        "browser": {"os": "Windows 10", "browser": "Chrome 126", "screen": "1920x1200"},
        "assignee": None,
        "messages": [
            {"body": "We set up the ShipStation webhook to automatically create support tickets when a shipment is delayed, but the webhook keeps returning a 503 error. It's been failing for about 2 hours now and we have shipments going out. Can someone take a look urgently?", "is_from_customer": True, "sender_email": None},
            {"body": "Hi Carlos, I've checked our webhook logs and I can see the failures. It looks like the payload format changed on ShipStation's end — they're sending an extra nested object now. Let me update our webhook parser to handle both formats. I'll deploy a fix within the next 30 minutes.", "is_from_customer": False, "sender_email": "marcus@syft.com"},
            {"body": "Thanks Marcus! 30 minutes sounds good. Will the historical failures retry automatically once the fix is deployed?", "is_from_customer": True, "sender_email": None},
        ],
    },
    {
        "org": "syft",
        "status": "closed",
        "priority": "normal",
        "channel": "widget",
        "subject": "Feature request — Advanced analytics dashboard",
        "customer_name": "Aisha Patel",
        "customer_email": "aisha.p@etailz.com",
        "location": "Toronto, ON",
        "browser": {"os": "macOS 14.3", "browser": "Safari 17.4", "screen": "2560x1600"},
        "assignee": "priya@syft.com",
        "messages": [
            {"body": "Would love to see a dashboard with CSAT trends, first response time, and bot deflection rate over time. Right now we're exporting data and building charts in Google Sheets. Are any analytics features on the roadmap?", "is_from_customer": True, "sender_email": None},
            {"body": "Hi Aisha! Great minds think alike! We're actually in beta with our Insights dashboard right now. It includes exactly what you mentioned — CSAT trends, response time benchmarks, deflection rate, and conversation volume analytics. I can add you to the beta if you'd like!", "is_from_customer": False, "sender_email": "priya@syft.com"},
            {"body": "Yes please! That would be amazing. Sign me up for the beta!", "is_from_customer": True, "sender_email": None},
            {"body": "Done! You should see a new 'Insights' tab in your dashboard now. Let me know what you think — we'd love your feedback before the GA launch next month.", "is_from_customer": False, "sender_email": "priya@syft.com"},
            {"body": "Just checked it out — it's exactly what we needed! The CSAT trends chart is beautiful. One small thing: it'd be great to filter by date range. Otherwise, fantastic work!", "is_from_customer": True, "sender_email": None},
        ],
    },
    {
        "org": "syft",
        "status": "open",
        "priority": "normal",
        "channel": "widget",
        "subject": "Webhook configuration for Slack integration",
        "customer_name": "Tom Baker",
        "customer_email": "tom.baker@codeandcoffee.dev",
        "location": "Berlin, DE",
        "browser": {"os": "Linux (Ubuntu 24.04)", "browser": "Firefox 128", "screen": "2560x1440"},
        "assignee": "marcus@syft.com",
        "messages": [
            {"body": "Trying to set up the Slack integration so we get notifications in our #support channel when new conversations come in. I've created the webhook in Slack but I'm not sure where to put the URL in Connect settings. Can you point me to the right spot?", "is_from_customer": True, "sender_email": None},
            {"body": "Hey Tom! You'll find it under Settings > Integrations > Slack. Paste the webhook URL there and select which events you want to be notified about. I'd recommend new conversations and urgent priority messages to start with!", "is_from_customer": False, "sender_email": "marcus@syft.com"},
            {"body": "Found it! Got it working now. One more question — can we set up different channels for different priority levels? Like urgent goes to #urgent-support and normal goes to #general-support?", "is_from_customer": True, "sender_email": None},
            {"body": "That's not supported out of the box yet, but you can achieve it by creating two webhook integrations with different event filters. I'll note this as a feature request for the roadmap though!", "is_from_customer": False, "sender_email": "marcus@syft.com"},
        ],
    },
    {
        "org": "syft",
        "status": "pending",
        "priority": "low",
        "channel": "email",
        "subject": "GDPR compliance — data retention policy",
        "customer_name": "Lisa Anderson",
        "customer_email": "lisa.a@medcore.health",
        "location": "Sydney, AU",
        "browser": {},
        "assignee": None,
        "messages": [
            {"body": "Hello, we're evaluating Connect for our healthcare platform and need to ensure GDPR compliance. Specifically: 1) How long do you retain customer conversation data? 2) Can we set up automatic deletion policies? 3) Do you offer data processing agreements (DPA)? Thanks!", "is_from_customer": True, "sender_email": None},
            {"body": "Hi Lisa, great questions! 1) We retain data for the duration of your subscription plus 90 days. 2) Yes, you can set custom retention policies in Settings > Data > Retention. 3) We have a standard DPA that we can sign — I'll have our legal team send it over. Would you like me to schedule a call to walk through the compliance features?", "is_from_customer": False, "sender_email": "priya@syft.com"},
        ],
    },
    {
        "org": "acme-corp",
        "status": "open",
        "priority": "high",
        "channel": "widget",
        "subject": "Widget not loading on mobile Safari",
        "customer_name": "Jennifer Blake",
        "customer_email": "jen.blake@acme.com",
        "location": "Austin, TX",
        "browser": {"os": "iOS 17.6", "browser": "Safari 17.6", "screen": "390x844"},
        "assignee": None,
        "messages": [
            {"body": "The chat widget doesn't load on mobile Safari at all. Works fine on Chrome desktop. I've cleared cache but no luck. Error in console says 'Failed to load widget config'", "is_from_customer": True, "sender_email": None},
            {"body": "Hi Jennifer, thanks for the detailed report! This is a known issue with iOS 17.6 and our widget SDK. We've released a fix in v2.4.1 — could you try updating the snippet on your site?", "is_from_customer": False, "sender_email": "tony@acme.com"},
        ],
    },
    {
        "org": "blueline",
        "status": "open",
        "priority": "normal",
        "channel": "email",
        "subject": "Report export not including attachments",
        "customer_name": "Mike O'Brien",
        "customer_email": "mike.obrien@blueline-logistics.com",
        "location": "Dublin, IE",
        "browser": {},
        "assignee": None,
        "messages": [
            {"body": "When I export the conversation report as CSV, the attachments column is always empty even though many conversations have file attachments. Is this a known bug or am I missing a setting?", "is_from_customer": True, "sender_email": None},
        ],
    },
]


class Command(BaseCommand):
    help = "Seeds the database with realistic demo data"

    def handle(self, *args, **options):
        now = timezone.now()

        Message.objects.all().delete()
        Conversation.objects.all().delete()

        for key, data in ORGS.items():
            org, created = Organization.objects.get_or_create(
                slug=data["slug"],
                defaults={
                    "name": data["name"],
                    "plan": data["plan"],
                },
            )
            if created:
                self.stdout.write(f"  Created org: {org.name}")

        agent_map = {}
        for a in AGENTS:
            org = Organization.objects.get(slug=a["org"])
            user, created = User.objects.get_or_create(
                email=a["email"],
                defaults={
                    "username": a["email"],
                    "first_name": a["first_name"],
                    "last_name": a["last_name"],
                    "password": make_password(a["password"]),
                    "role": a["role"],
                    "status": "active",
                    "organization": org,
                    "is_active": True,
                },
            )
            if created:
                self.stdout.write(f"  Created agent: {user.email}")
            agent_map[a["email"]] = user

        user_count = User.objects.count()
        org_count = Organization.objects.count()
        self.stdout.write(f"\nUsers: {user_count}  |  Orgs: {org_count}")

        conv_count = 0
        msg_count = 0
        for i, c in enumerate(CONVERSATIONS):
            org = Organization.objects.get(slug=c["org"])
            assignee = agent_map.get(c["assignee"]) if c["assignee"] else None

            created_at = now - timedelta(hours=len(CONVERSATIONS) - i, minutes=15)

            conv = Conversation.objects.create(
                organization=org,
                status=c["status"],
                priority=c["priority"],
                channel=c["channel"],
                subject=c["subject"],
                customer_name=c["customer_name"],
                customer_email=c["customer_email"],
                location=c["location"],
                browser=c["browser"],
                assignee=assignee,
                last_message_at=created_at,
                created_at=created_at,
                updated_at=created_at,
            )

            for j, m in enumerate(c["messages"]):
                sender = None
                if m["sender_email"]:
                    sender = agent_map.get(m["sender_email"])

                is_last = j == len(c["messages"]) - 1
                if is_last and c.get("live"):
                    msg_created_at = now - timedelta(seconds=30)
                else:
                    msg_created_at = created_at + timedelta(minutes=j * 8 + 1)

                Message.objects.create(
                    conversation=conv,
                    type="reply",
                    body=m["body"],
                    sender=sender,
                    is_from_customer=m["is_from_customer"],
                    read_at=msg_created_at,
                    created_at=msg_created_at,
                )
                conv.last_message_at = msg_created_at

                Message.objects.create(
                    conversation=conv,
                    type="reply",
                    body=m["body"],
                    sender=sender,
                    is_from_customer=m["is_from_customer"],
                    created_at=msg_created_at,
                )
                conv.last_message_at = msg_created_at

            conv.save(update_fields=["last_message_at"])
            conv_count += 1
            msg_count += len(c["messages"])
            self.stdout.write(f"  [{c['status']}] {c['customer_name']} — {c['subject'][:50]}…")

        self.stdout.write(self.style.SUCCESS(
            f"\nDone! {conv_count} conversations, {msg_count} messages seeded."
        ))
