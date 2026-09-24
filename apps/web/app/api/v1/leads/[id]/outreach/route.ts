import { NextResponse } from 'next/server';

interface OutreachRequest {
  channel: 'email' | 'whatsapp' | 'linkedin';
  business_name: string;
  city?: string;
  rating?: number;
  review_count?: number;
  top_opportunity?: string;
  technical_deficit?: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: OutreachRequest = await request.json().catch(() => ({}));
    const channel = body.channel || 'email';
    const businessName = body.business_name || 'Local Business';
    const city = body.city || 'your area';
    const rating = body.rating ? body.rating.toFixed(1) : '4.8';
    const reviews = body.review_count || 24;
    const topOpportunity = body.top_opportunity || 'absent online booking and mobile conversion latency';
    const deficit = body.technical_deficit || 'slow TTFB server response time and missing mobile click-to-call action';

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey && apiKey.trim().startsWith('sk-')) {
      try {
        let systemPrompt = '';
        let userPrompt = '';

        if (channel === 'whatsapp') {
          systemPrompt =
            'You are an elite B2B sales development representative drafting high-converting WhatsApp outreach messages for agency closers. You MUST keep the message concise, natural, polite, and strictly UNDER 380 CHARACTERS. No buzzwords, no spam.';
          userPrompt = `Write a short, compelling WhatsApp message to ${businessName} in ${city}. They have a ${rating}★ rating on Google Maps with ${reviews} reviews. Highlight their key website deficit: "${topOpportunity}". Offer a quick 2-minute video audit link. Must be under 380 characters.`;
        } else if (channel === 'linkedin') {
          systemPrompt =
            'You are a high-level digital agency growth consultant drafting executive LinkedIn InMail messages to business owners. Tone: authoritative, peer-to-peer, data-driven, respectful.';
          userPrompt = `Write a LinkedIn InMail to the owner of ${businessName} in ${city}. Commend their strong local reputation (${rating}★ on ${reviews} reviews), but highlight a critical conversion bottleneck: "${topOpportunity}" and "${deficit}". Propose a brief 5-minute exploratory chat. Format as JSON with "subject" and "body" fields.`;
        } else {
          // Email
          systemPrompt =
            'You are a senior technical sales director writing bespoke, high-converting cold emails for digital agencies. Tone: direct, evidence-backed, value-first, concise. Never sound like generic marketing spam.';
          userPrompt = `Write a cold email to ${businessName} in ${city}. Mention their ${rating}★ Google rating and review momentum. Point out their specific digital deficit: "${topOpportunity}". Explain how fixing this unlocks 25-40% more inbound calls and booked appointments from their existing traffic. Offer a personalized 3-minute video breakdown. Format as JSON with "subject" and "body" fields.`;
        }

        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        });

        if (openAiRes.ok) {
          const completion = await openAiRes.json();
          const content = completion.choices?.[0]?.message?.content || '';

          if (channel === 'whatsapp') {
            const cleanText = content.replace(/^["']|["']$/g, '').trim();
            return NextResponse.json({
              success: true,
              data: {
                lead_id: id,
                channel: 'whatsapp',
                subject: null,
                body: cleanText.length > 400 ? cleanText.slice(0, 397) + '...' : cleanText,
                provider: 'openai_gpt4o',
              },
            });
          }

          // Try to parse JSON output if model returned JSON
          try {
            const parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
            return NextResponse.json({
              success: true,
              data: {
                lead_id: id,
                channel,
                subject: parsed.subject || `Quick note regarding ${businessName}'s digital presence`,
                body: parsed.body || content,
                provider: 'openai_gpt4o',
              },
            });
          } catch {
            // If raw text returned, extract subject and body
            const lines = content.split('\n');
            const subjectLine = lines.find((l: string) => l.toLowerCase().startsWith('subject:'));
            const subject = subjectLine ? subjectLine.replace(/^subject:\s*/i, '').trim() : `Observation regarding ${businessName}`;
            const bodyText = lines.filter((l: string) => !l.toLowerCase().startsWith('subject:')).join('\n').trim();

            return NextResponse.json({
              success: true,
              data: {
                lead_id: id,
                channel,
                subject,
                body: bodyText || content,
                provider: 'openai_gpt4o',
              },
            });
          }
        }
      } catch (openAiErr) {
        console.warn('OpenAI API call failed, using deterministic fallback:', openAiErr);
      }
    }

    // Deterministic Rule-Based Fallback
    if (channel === 'whatsapp') {
      const wa = `Hi ${businessName}! Impressed by your ${rating}★ on Maps. Ran a quick diagnostic on your site and noticed friction around ${topOpportunity.slice(0, 35)} leaking calls. Put together a 2-min breakdown on how to fix it: leadmap.io/d/${id}. Open to a quick chat?`;
      return NextResponse.json({
        success: true,
        data: {
          lead_id: id,
          channel: 'whatsapp',
          subject: null,
          body: wa.length > 400 ? wa.slice(0, 397) + '...' : wa,
          provider: 'deterministic_engine',
        },
      });
    }

    if (channel === 'linkedin') {
      return NextResponse.json({
        success: true,
        data: {
          lead_id: id,
          channel: 'linkedin',
          subject: `Digital audit insight for ${businessName}`,
          body: `Hi there,\n\nI've been following ${businessName}'s market presence in ${city} and wanted to reach out directly. While benchmarking local digital customer journeys, our automated intelligence engine flagged an optimization deficit on your web properties—namely ${topOpportunity}.\n\nWe specialize in high-converting web optimization for high-growth local brands, typically increasing qualified inbound conversions without increasing ad spend.\n\nOpen to connecting here on LinkedIn or reviewing our executive summary deck?\n\nBest,\nLead Intelligence Director`,
          provider: 'deterministic_engine',
        },
      });
    }

    // Default Email
    return NextResponse.json({
      success: true,
      data: {
        lead_id: id,
        channel: 'email',
        subject: `Quick observation regarding ${businessName}'s website (${city})`,
        body: `Hi ${businessName} team,\n\nI recently came across your business while researching high-rated local leaders in ${city} (congrats on maintaining a solid ${rating}★ rating across ${reviews} Google reviews). Out of curiosity, I ran a brief technical diagnostic on your website and noticed a key area holding back your inbound inquiries: ${topOpportunity}.\n\nSpecifically, local customers browsing on mobile devices encounter friction before they can reach your booking page. Resolving this routinely unlocks a 20–35% lift in booked appointments and direct phone calls from existing organic traffic.\n\nI put together a quick 3-minute screen audit detailing the exact adjustments. Would you be open to a 5-minute chat this Thursday, or should I send over the private video link first?\n\nBest regards,\nGrowth Engineering Team`,
        provider: 'deterministic_engine',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to synthesize outreach draft.',
      },
      { status: 500 }
    );
  }
}
