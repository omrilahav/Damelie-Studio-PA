import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Email sending endpoint
// This can be extended to use various email providers (Resend, SendGrid, etc.)
// For now, it marks reminders as "sent" after simulating the send

export async function POST(request: NextRequest) {
  try {
    const { reminderId, to, subject, body } = await request.json();

    if (!reminderId) {
      return NextResponse.json(
        { error: "Reminder ID is required" },
        { status: 400 }
      );
    }

    // Get the reminder
    const reminder = await db.reminder.findUnique({
      where: { id: reminderId },
      include: {
        task: {
          include: {
            project: {
              include: { client: true },
            },
          },
        },
      },
    });

    if (!reminder) {
      return NextResponse.json(
        { error: "Reminder not found" },
        { status: 404 }
      );
    }

    if (reminder.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Reminder must be approved before sending" },
        { status: 400 }
      );
    }

    const recipientEmail = to || reminder.recipient || reminder.task.project?.client?.email;

    if (!recipientEmail) {
      return NextResponse.json(
        { error: "No recipient email address available" },
        { status: 400 }
      );
    }

    // Get settings to check for email configuration
    const settings = await db.systemSettings.findUnique({
      where: { id: "default" },
    });

    // In a real implementation, you would integrate with an email service here
    // For example:
    // - Resend: await resend.emails.send({ ... })
    // - SendGrid: await sgMail.send({ ... })
    // - Nodemailer: await transporter.sendMail({ ... })
    
    // For now, we'll simulate the send and update the status
    console.log("📧 Sending email:", {
      to: recipientEmail,
      subject: subject || `Reminder: ${reminder.task.title}`,
      body: body || reminder.message,
      from: settings?.userName || "Damelie Studio",
    });

    // Update reminder status to SENT
    await db.reminder.update({
      where: { id: reminderId },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        entityType: "REMINDER",
        entityId: reminderId,
        action: "UPDATED",
        description: `Sent reminder to ${recipientEmail}: ${reminder.task.title}`,
        metadata: JSON.stringify({ recipient: recipientEmail, method: "email" }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Email sent to ${recipientEmail}`,
      reminderId,
    });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
