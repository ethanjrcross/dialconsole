'use strict';

window.DC_SCRIPT_SEEDS = [
  {
    "id": "default-1",
    "group": "Gatekeeper",
    "title": "Opener",
    "body": "Hey! Is the owner around?",
    "note": "Keep it casual. Short. Don't explain yourself yet.",
    "order": 1,
    "custom": false,
    "isDefaultEdited": false
  },
  {
    "id": "default-2",
    "group": "Gatekeeper",
    "title": "Who's calling / what's this about",
    "body": "I'm Ethan, I work with solar companies on their digital marketing. Wanted a quick two-minute chat with him, that's all.",
    "note": "Don't say \"Meta ads\" or \"lead generation\" yet.",
    "order": 2,
    "custom": false,
    "isDefaultEdited": false
  },
  {
    "id": "default-3",
    "group": "Gatekeeper",
    "title": "He's busy / not available",
    "body": "\"Totally fine! What's usually the best time to reach him directly, so I don't keep calling at a bad time?\" ALT: \"No worries, is there a direct number I can reach him on, or should I try back in an hour?\"",
    "note": "Goal is a specific callback window, not \"I'll try later\". Use the Callback button.",
    "order": 3,
    "custom": false,
    "isDefaultEdited": false
  },
  {
    "id": "default-4",
    "group": "Gatekeeper",
    "title": "Can I take a message",
    "body": "Thanks, I appreciate it, but honestly it's a quick thing, better to catch him live. I'll call back. When does he usually come in?",
    "note": "",
    "order": 4,
    "custom": false,
    "isDefaultEdited": false
  },
  {
    "id": "default-5",
    "group": "Gatekeeper",
    "title": "Pressed hard (what company / why)",
    "body": "I run a small performance marketing agency. We specifically work with solar companies on their Meta ad campaigns. I just wanted 60 seconds with the owner to see if it even makes sense for them.",
    "note": "",
    "order": 5,
    "custom": false,
    "isDefaultEdited": false
  },
  {
    "id": "default-6",
    "group": "Owner opener",
    "title": "Capacity question A",
    "body": "Hey, it's Ethan calling. Am I speaking to the owner of {company}? ... Awesome, I have a quick question for you. I'm not sure if you're the right person to ask. Could your installation team handle another 4 to 5 residential rooftop solar projects every month right now, or is your team fully busy?",
    "note": "",
    "order": 6,
    "custom": false,
    "isDefaultEdited": false
  },
  {
    "id": "default-7",
    "group": "Owner opener",
    "title": "Capacity question B",
    "body": "Hey {owner}, it's Ethan calling. Almost every other solar company in {city} seems to be completely booked out with installations for the next couple of weeks. Is your team equipped to take on another 4 to 5 rooftop solar installations this month, or are you operating at max capacity?",
    "note": "",
    "order": 7,
    "custom": false,
    "isDefaultEdited": false
  },
  {
    "id": "default-8",
    "group": "Pitch",
    "title": "If they have capacity",
    "body": "\"Got it. That's exactly why I'm calling. I run Meta ad campaigns specifically for solar companies. What I do is put your business in front of homeowners in {city} who are already looking to go solar right now. Makes sense so far?\" [PAUSE] \"You only pay for the ad spend, directly to Meta. I get paid per qualified lead I bring you, so I only make money if you're getting real qualified leads. If this sounds worth hearing, can we grab 20 minutes on a Google Meet this week? I'll show you exactly how it works for your market. You tell me if it makes sense, and if it's not useful you can just walk away. Are you free tomorrow at 10 or 11 in the morning?\"",
    "note": "",
    "order": 8,
    "custom": false,
    "isDefaultEdited": false
  },
  {
    "id": "default-9",
    "group": "Pitch",
    "title": "Who are you / what do you do",
    "body": "\"Yeah, of course. I run Meta ad campaigns specifically for solar companies. What I do is put your business in front of homeowners in {city} who are already looking to go solar right now. Makes sense so far?\" [PAUSE] then continue from the pitch above (\"You only pay for the ad spend...\").",
    "note": "",
    "order": 9,
    "custom": false,
    "isDefaultEdited": false
  },
  {
    "id": "default-10",
    "group": "Pitch",
    "title": "They ask you to send details now",
    "body": "Okay, sure. Before I send the WhatsApp, can I explain what it's about shortly, and then you decide if it even makes sense?",
    "note": "",
    "order": 10,
    "custom": false,
    "isDefaultEdited": false
  },
  {
    "id": "default-11",
    "group": "Pitch",
    "title": "How do you bring those leads",
    "body": "Meta ads, Facebook and Instagram. I target homeowners in your city based on property type, location and behaviour signals. Before they can request a quote from you, they go through a short screening so you're not wasting time on renters or people just window shopping. The whole thing runs on your ad account and your budget. I just build and manage the campaigns. That's exactly what I want to walk you through on the call. Are you free Tuesday or Wednesday morning?",
    "note": "",
    "order": 11,
    "custom": false,
    "isDefaultEdited": false
  },
  {
    "id": "default-12",
    "group": "Objections",
    "title": "Not interested (before the pitch)",
    "body": "Ahh yeah, I totally get it. Just out of curiosity, is it that you're already sorted for leads, or ads just haven't worked for you before?",
    "note": "One question only. If they say \"just not interested\" again: \"No problem at all. Thanks for your time.\" Hang up, mark Dead.",
    "order": 12,
    "custom": false,
    "isDefaultEdited": false
  },
  {
    "id": "default-13",
    "group": "Objections",
    "title": "Not interested (after the pitch)",
    "body": "\"That's completely fine. Is it the timing, or is it that leads from ads haven't been worth it for you in the past?\" IF TIMING: \"Understood. When would be a better time to revisit this? Would end of month make more sense?\" (then use Callback). IF BAD PAST EXPERIENCE: use script 17.",
    "note": "",
    "order": 13,
    "custom": false,
    "isDefaultEdited": false
  },
  {
    "id": "default-14",
    "group": "Objections",
    "title": "\"Send your details on WhatsApp, we'll verify and call back\"",
    "body": "\"Yeah, sure, I can do that. But can we schedule the meeting now, on the call? It creates a lot more friction to book later, and life gets busy. If the proposal I send isn't useful, you can just cancel the meeting. How's that sound?\" FALLBACK: \"Totally understand. Is {owner} the right person I should be sending this to, or is there someone else who handles decisions like this? ... What's the best time to reach them directly? I'd rather just have a two-minute conversation than send something that gets buried.\"",
    "note": "If they insist on WhatsApp only, send ONE short message with no attachments (see script 22), follow up once after 48 hours, then mark Dead.",
    "order": 14,
    "custom": false,
    "isDefaultEdited": false
  },
  {
    "id": "default-15",
    "group": "Objections",
    "title": "\"We're running ads / marketing ourselves\"",
    "body": "\"Oh nice, how's that going for you? What kind of cost per lead are you seeing right now?\" IF THEY HESITATE: \"Totally get it. The reason I ask is most solar companies I talk to are spending money on ads but don't have a clear number on what each lead is actually costing them. That's the first thing I fix. Worth 20 minutes to see what that looks like for your market?\"",
    "note": "",
    "order": 15,
    "custom": false,
    "isDefaultEdited": false
  },
  {
    "id": "default-16",
    "group": "Objections",
    "title": "\"We're booked out for the next 2-3 months\"",
    "body": "(appreciate first: \"That's great, sounds like business is doing well.\") \"Awesome. That's actually perfect timing for this conversation. The campaigns take 3-4 weeks to ramp up properly, so by the time you have capacity you'd already have a warm pipeline of homeowners ready to book. Right now you'd be starting from zero when that capacity opens. Does it make sense to at least see what it looks like? You don't have to start now, just see the approach. If it doesn't make sense, you can just walk away.\" IF STILL NO: \"Understood. Can I check back in with you in a few weeks when things open up?\"",
    "note": "Lock a Callback in 6 weeks. These are your warmest future leads.",
    "order": 16,
    "custom": false,
    "isDefaultEdited": false
  },
  {
    "id": "default-17",
    "group": "Objections",
    "title": "\"We tried ads before, didn't work\"",
    "body": "\"Most solar companies that tried ads and got burned were running them without any qualification on the front end, so they were paying for people who were renting or just curious, not actual homeowners with a real roof and a real bill. What I do differently is screen before the lead ever reaches you. What was the main issue, the lead quality or the volume?\" [LET THEM ANSWER] \"That's exactly the problem I build the system to fix. I'm not going to ask you to take my word for it. That's exactly why I offer a 60-day pilot at a reduced rate. You see the leads coming in, you judge the quality yourself. If it's not working by day 30, you tell me and we course correct. Can we hop on a 20-minute Google Meet this week so I can show you what the targeting would look like for your specific area?\"",
    "note": "",
    "order": 17,
    "custom": false,
    "isDefaultEdited": false
  },
  {
    "id": "default-18",
    "group": "Book the meeting",
    "title": "The one ask",
    "body": "Can we grab 15 to 20 minutes on a Google Meet this week? I'll walk you through exactly what I'd run for your market. You decide if it makes sense. Are you free Tuesday or Wednesday around 10?",
    "note": "One meeting. No close on the first call. The meeting is the only goal.",
    "order": 18,
    "custom": false,
    "isDefaultEdited": false
  },
  {
    "id": "default-19",
    "group": "Book the meeting",
    "title": "Capture details (read in order, then press 4)",
    "body": "What's your name? ... What's your email? Alright, is it ...? ... What's your WhatsApp number, the one you check more? ... Just so I can prepare for your situation specifically: what does your lead pipeline look like right now? Mostly referrals, or do you have something running already? ... Awesome, I'll send the meeting link in a few minutes.",
    "note": "",
    "order": 19,
    "custom": false,
    "isDefaultEdited": false
  },
  {
    "id": "default-20",
    "group": "Book the meeting",
    "title": "Reminder permission",
    "body": "Is it cool if I call you a few minutes before the meeting, just to check in and remind you?",
    "note": "",
    "order": 20,
    "custom": false,
    "isDefaultEdited": false
  },
  {
    "id": "default-21",
    "group": "Book the meeting",
    "title": "WhatsApp after booking (template)",
    "body": "Hi {owner}, it's Ethan, we just spoke. Confirming our Google Meet on {meeting_time}. Link: {booking_link}. I'll walk you through exactly what I'd run for solar homeowners in {city}.",
    "note": "",
    "order": 21,
    "custom": false,
    "isDefaultEdited": false
  },
  {
    "id": "default-22",
    "group": "Book the meeting",
    "title": "WhatsApp cold text (only if they insist, no attachments)",
    "body": "Hi {owner}, it's Ethan. I called your office earlier. I run Meta ad campaigns for solar companies in {city}. Currently taking on 5 pilot clients at a reduced rate to build case studies. If you're open to 20 minutes this week, I'll show you exactly what I'd run for your market. Just reply and we'll set a time.",
    "note": "",
    "order": 22,
    "custom": false,
    "isDefaultEdited": false
  }
];
