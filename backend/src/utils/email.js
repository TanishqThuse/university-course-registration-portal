/**
 * Email Service
 * Handles sending emails using Nodemailer
 */

const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });
};

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @returns {Promise<boolean>} Success status
 */
const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@university.edu',
            to,
            subject,
            text,
            html: html || text
        };

        const info = await transporter.sendMail(mailOptions);
        
        logger.info('Email sent successfully', {
            messageId: info.messageId,
            to,
            subject
        });

        return true;
    } catch (error) {
        logger.error('Failed to send email:', {
            error: error.message,
            to,
            subject
        });
        return false;
    }
};

/**
 * Send registration confirmation email
 */
const sendRegistrationConfirmation = async (user, courses) => {
    const courseList = courses.map(c => `- ${c.course_code}: ${c.course_name}`).join('\n');
    
    const subject = 'Course Registration Confirmation';
    const text = `Dear ${user.first_name} ${user.last_name},\n\n` +
        `Your course registration has been confirmed.\n\n` +
        `Registered Courses:\n${courseList}\n\n` +
        `You can view your complete schedule by logging into the student portal.\n\n` +
        `Best regards,\nUniversity Registrar`;

    const html = `
        <h2>Course Registration Confirmation</h2>
        <p>Dear ${user.first_name} ${user.last_name},</p>
        <p>Your course registration has been confirmed.</p>
        <h3>Registered Courses:</h3>
        <ul>
            ${courses.map(c => `<li><strong>${c.course_code}</strong>: ${c.course_name}</li>`).join('')}
        </ul>
        <p>You can view your complete schedule by logging into the student portal.</p>
        <p>Best regards,<br>University Registrar</p>
    `;

    return sendEmail({ to: user.email, subject, text, html });
};

/**
 * Send grade publication notification
 */
const sendGradeNotification = async (user, course, grade) => {
    const subject = 'Grades Published';
    const text = `Dear ${user.first_name} ${user.last_name},\n\n` +
        `Your grade for ${course.course_code} - ${course.course_name} has been published.\n\n` +
        `Grade: ${grade}\n\n` +
        `You can view your complete transcript by logging into the student portal.\n\n` +
        `Best regards,\nUniversity Registrar`;

    const html = `
        <h2>Grades Published</h2>
        <p>Dear ${user.first_name} ${user.last_name},</p>
        <p>Your grade for <strong>${course.course_code} - ${course.course_name}</strong> has been published.</p>
        <p><strong>Grade: ${grade}</strong></p>
        <p>You can view your complete transcript by logging into the student portal.</p>
        <p>Best regards,<br>University Registrar</p>
    `;

    return sendEmail({ to: user.email, subject, text, html });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (user, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const subject = 'Password Reset Request';
    const text = `Dear ${user.first_name} ${user.last_name},\n\n` +
        `You requested a password reset for your account.\n\n` +
        `Please click the following link to reset your password:\n${resetUrl}\n\n` +
        `This link will expire in 1 hour.\n\n` +
        `If you did not request this reset, please ignore this email.\n\n` +
        `Best regards,\nUniversity IT Support`;

    const html = `
        <h2>Password Reset Request</h2>
        <p>Dear ${user.first_name} ${user.last_name},</p>
        <p>You requested a password reset for your account.</p>
        <p>Please click the button below to reset your password:</p>
        <p><a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
        <p>Or copy and paste this link into your browser:<br>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this reset, please ignore this email.</p>
        <p>Best regards,<br>University IT Support</p>
    `;

    return sendEmail({ to: user.email, subject, text, html });
};

/**
 * Send waitlist notification
 */
const sendWaitlistNotification = async (user, course, position) => {
    const subject = 'Waitlist Confirmation';
    const text = `Dear ${user.first_name} ${user.last_name},\n\n` +
        `You have been added to the waitlist for ${course.course_code} - ${course.course_name}.\n\n` +
        `Your position: ${position}\n\n` +
        `You will be notified if a seat becomes available.\n\n` +
        `Best regards,\nUniversity Registrar`;

    const html = `
        <h2>Waitlist Confirmation</h2>
        <p>Dear ${user.first_name} ${user.last_name},</p>
        <p>You have been added to the waitlist for <strong>${course.course_code} - ${course.course_name}</strong>.</p>
        <p><strong>Your position: ${position}</strong></p>
        <p>You will be notified if a seat becomes available.</p>
        <p>Best regards,<br>University Registrar</p>
    `;

    return sendEmail({ to: user.email, subject, text, html });
};

/**
 * Send enrollment from waitlist notification
 */
const sendWaitlistEnrollmentNotification = async (user, course) => {
    const subject = 'Enrolled from Waitlist';
    const text = `Dear ${user.first_name} ${user.last_name},\n\n` +
        `Great news! A seat has become available and you have been automatically enrolled in:\n` +
        `${course.course_code} - ${course.course_name}\n\n` +
        `You can view your updated schedule in the student portal.\n\n` +
        `Best regards,\nUniversity Registrar`;

    const html = `
        <h2>Enrolled from Waitlist</h2>
        <p>Dear ${user.first_name} ${user.last_name},</p>
        <p>Great news! A seat has become available and you have been automatically enrolled in:</p>
        <p><strong>${course.course_code} - ${course.course_name}</strong></p>
        <p>You can view your updated schedule in the student portal.</p>
        <p>Best regards,<br>University Registrar</p>
    `;

    return sendEmail({ to: user.email, subject, text, html });
};

module.exports = {
    sendEmail,
    sendRegistrationConfirmation,
    sendGradeNotification,
    sendPasswordResetEmail,
    sendWaitlistNotification,
    sendWaitlistEnrollmentNotification
};
