const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configure email transporter
// Option 1: Using Gmail (easiest setup)
// You'll need to create an App Password in your Gmail account
// Go to: Google Account > Security > 2-Step Verification > App passwords
const gmailEmail = functions.config().gmail?.email || 'your-email@gmail.com';
const gmailPassword = functions.config().gmail?.password || 'your-app-password';

// Option 2: Using SMTP (for other email providers)
const smtpConfig = {
  host: functions.config().smtp?.host || 'smtp.gmail.com',
  port: functions.config().smtp?.port || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: functions.config().smtp?.user || gmailEmail,
    pass: functions.config().smtp?.pass || gmailPassword,
  },
};

const transporter = nodemailer.createTransport(smtpConfig);

/**
 * Cloud Function to send redemption email
 * Callable from the frontend
 */
exports.sendRedemptionEmail = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to send emails'
    );
  }

  try {
    const {
      to,
      subject,
      rewardName,
      rewardDescription,
      category,
      pointsRequired,
      studentEmail,
      studentPhone,
      deliveryAddress,
      studentIdUrl,
      redemptionDate,
      redemptionId,
    } = data;

    // Validate required fields
    if (!to || !subject || !rewardName) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required email fields'
      );
    }

    // Create HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
            .label { font-weight: bold; color: #667eea; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🎁 New Reward Redemption</h2>
            </div>
            <div class="content">
              <div class="info-box">
                <div class="label">Reward Name:</div>
                <div>${rewardName}</div>
              </div>
              
              <div class="info-box">
                <div class="label">Description:</div>
                <div>${rewardDescription || 'N/A'}</div>
              </div>
              
              <div class="info-box">
                <div class="label">Category:</div>
                <div>${category}</div>
              </div>
              
              <div class="info-box">
                <div class="label">Points Required:</div>
                <div>${pointsRequired} points</div>
              </div>
              
              <h3 style="color: #667eea; margin-top: 20px;">Student Information</h3>
              
              <div class="info-box">
                <div class="label">Email:</div>
                <div><a href="mailto:${studentEmail}">${studentEmail}</a></div>
              </div>
              
              <div class="info-box">
                <div class="label">Phone:</div>
                <div><a href="tel:${studentPhone}">${studentPhone}</a></div>
              </div>
              
              <div class="info-box">
                <div class="label">Delivery Address:</div>
                <div>${deliveryAddress || 'N/A'}</div>
              </div>
              
              ${studentIdUrl ? `
              <div class="info-box">
                <div class="label">Student ID:</div>
                <div><a href="${studentIdUrl}" target="_blank">View Student ID</a></div>
              </div>
              ` : ''}
              
              <div class="info-box">
                <div class="label">Redemption Date:</div>
                <div>${redemptionDate}</div>
              </div>
              
              <div class="info-box">
                <div class="label">Redemption ID:</div>
                <div>${redemptionId}</div>
              </div>
              
              <div class="footer">
                <p>This is an automated notification from Truesight University Rewards System.</p>
                <p>Please process this redemption and update the status in the admin panel.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Plain text version
    const textContent = `
New Reward Redemption

Reward: ${rewardName}
Description: ${rewardDescription || 'N/A'}
Category: ${category}
Points Required: ${pointsRequired}

Student Information:
Email: ${studentEmail}
Phone: ${studentPhone}
Delivery Address: ${deliveryAddress || 'N/A'}
Student ID: ${studentIdUrl || 'N/A'}

Redemption Date: ${redemptionDate}
Redemption ID: ${redemptionId}

This is an automated notification from Truesight University Rewards System.
    `;

    // Send email
    const mailOptions = {
      from: `"Truesight University" <${gmailEmail}>`,
      to: to,
      subject: subject,
      text: textContent,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully',
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send email',
      error.message
    );
  }
});

/**
 * Cloud Function to send OTP for password reset
 * Callable from the frontend (admin only)
 */
exports.sendPasswordResetOTP = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to send OTP'
    );
  }

  try {
    const { email, userId } = data;

    // Validate required fields
    if (!email || !userId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Email and userId are required'
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes

    // Get app URL from config or use default
    const appUrl = functions.config().app?.url || 'https://your-app-url.com';

    // Store OTP in Firestore
    const db = admin.firestore();
    const otpRef = db.collection('passwordResetOTPs').doc(userId);
    await otpRef.set({
      otp: otp,
      email: email,
      userId: userId,
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      used: false
    });

    // Create HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; border: 2px dashed #667eea; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .info-box { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
            .warning { background: #fff3cd; border-left-color: #ffc107; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🔐 Password Reset OTP</h2>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>An administrator has initiated a password reset for your account. Use the OTP below to reset your password:</p>
              
              <div class="otp-box">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Your OTP Code:</p>
                <div class="otp-code">${otp}</div>
              </div>

              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This OTP is valid for 10 minutes only</li>
                  <li>Do not share this OTP with anyone</li>
                  <li>If you didn't request this, please ignore this email</li>
                </ul>
              </div>

              <div class="info-box">
                <p style="margin: 0;"><strong>Next Steps:</strong></p>
                <ol style="margin: 10px 0; padding-left: 20px;">
                  <li>Click the link below or go to the password reset page</li>
                  <li>Enter your email and the OTP code</li>
                  <li>Set your new password</li>
                </ol>
                <div style="text-align: center; margin-top: 20px;">
                  <a href="${appUrl}/resetpassword-otp?email=${encodeURIComponent(email)}" 
                     style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Reset Password
                  </a>
                </div>
              </div>
              
              <div class="footer">
                <p>This is an automated email from Truesight University.</p>
                <p>If you have any concerns, please contact support immediately.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Plain text version
    const textContent = `
Password Reset OTP

An administrator has initiated a password reset for your account.

Your OTP Code: ${otp}

This OTP is valid for 10 minutes only.

Important:
- Do not share this OTP with anyone
- If you didn't request this, please ignore this email

Next Steps:
1. Go to: ${appUrl}/resetpassword-otp?email=${encodeURIComponent(email)}
2. Enter your email and the OTP code
3. Set your new password

This is an automated email from Truesight University.
    `;

    // Send email
    const mailOptions = {
      from: `"Truesight University" <${gmailEmail}>`,
      to: email,
      subject: 'Password Reset OTP - Truesight University',
      text: textContent,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('OTP email sent successfully:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
      message: 'OTP sent successfully to user email',
    };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send OTP email',
      error.message
    );
  }
});

/**
 * Cloud Function to verify OTP and reset password
 * Callable from the frontend
 */
exports.verifyOTPAndResetPassword = functions.https.onCall(async (data, context) => {
  try {
    const { email, otp, newPassword } = data;

    // Validate required fields
    if (!email || !otp || !newPassword) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Email, OTP, and new password are required'
      );
    }

    // Validate password length
    if (newPassword.length < 6) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Password must be at least 6 characters long'
      );
    }

    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    const userId = userRecord.uid;

    // Check OTP in Firestore
    const db = admin.firestore();
    const otpRef = db.collection('passwordResetOTPs').doc(userId);
    const otpDoc = await otpRef.get();

    if (!otpDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'OTP not found. Please request a new OTP.'
      );
    }

    const otpData = otpDoc.data();

    // Check if OTP is already used
    if (otpData.used) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'This OTP has already been used. Please request a new OTP.'
      );
    }

    // Check if OTP is expired
    const expiresAt = otpData.expiresAt.toDate();
    if (new Date() > expiresAt) {
      throw new functions.https.HttpsError(
        'deadline-exceeded',
        'OTP has expired. Please request a new OTP.'
      );
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid OTP. Please check and try again.'
      );
    }

    // Update password
    await admin.auth().updateUser(userId, {
      password: newPassword
    });

    // Mark OTP as used
    await otpRef.update({
      used: true,
      usedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Password reset successfully for user:', email);
    
    return {
      success: true,
      message: 'Password reset successfully'
    };
  } catch (error) {
    console.error('Error verifying OTP and resetting password:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      'internal',
      'Failed to reset password',
      error.message
    );
  }
});

/**
 * Cloud Function to initialize rewards in Firestore
 * This will add the default rewards including the new ones
 * Callable from the frontend (admin only recommended)
 */
exports.initializeRewards = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  try {
    const db = admin.firestore();
    const rewardsRef = db.collection('rewards');

    // Default rewards including the new ones
    const rewards = [
      // Wellness Category
      {
        id: 17,
        name: "Yoga Mat",
        description: "Premium quality yoga mat for fitness and wellness",
        icon: "heart",
        color: "text-red-600",
        bgColor: "bg-red-100",
        pointsRequired: 10,
        category: "wellness",
        type: "physical",
        accessible: true,
        stock: null // null means unlimited
      },
      {
        id: 18,
        name: "Fitness Tracker",
        description: "Track your daily activities and health metrics",
        icon: "heart",
        color: "text-red-600",
        bgColor: "bg-red-100",
        pointsRequired: 400,
        category: "wellness",
        type: "physical",
        accessible: true,
        stock: null
      },
      {
        id: 19,
        name: "Massage Voucher",
        description: "Relaxation massage voucher for stress relief",
        icon: "heart",
        color: "text-red-600",
        bgColor: "bg-red-100",
        pointsRequired: 300,
        category: "wellness",
        type: "voucher",
        accessible: true,
        stock: null
      },

      // Fantasy Category
      {
        id: 20,
        name: "Collectible Action Figure",
        description: "Limited edition action figure from popular series",
        icon: "dragon",
        color: "text-indigo-600",
        bgColor: "bg-indigo-100",
        pointsRequired: 350,
        category: "fantasy",
        type: "physical",
        accessible: true,
        stock: null
      },
      {
        id: 22,
        name: "Limited Edition Collectible",
        description: "Rare collectible item from trending franchises",
        icon: "dragon",
        color: "text-indigo-600",
        bgColor: "bg-indigo-100",
        pointsRequired: 600,
        category: "fantasy",
        type: "physical",
        accessible: true,
        stock: null
      },
      // New rewards - Harry Potter items
      {
        id: 23,
        name: "Harry Potter Gift Set",
        description: "Exclusive Harry Potter gift set with collectibles",
        icon: "dragon",
        color: "text-indigo-600",
        bgColor: "bg-indigo-100",
        pointsRequired: 500,
        category: "fantasy",
        type: "physical",
        accessible: true,
        stock: null
      },
      {
        id: 24,
        name: "Harry Potter Wand Collectible",
        description: "Authentic Harry Potter wand collectible",
        icon: "dragon",
        color: "text-indigo-600",
        bgColor: "bg-indigo-100",
        pointsRequired: 400,
        category: "fantasy",
        type: "physical",
        accessible: true,
        stock: 4 // 4 units available
      },
      {
        id: 25,
        name: "Anime Figurines",
        description: "Premium anime character figurines collection",
        icon: "dragon",
        color: "text-indigo-600",
        bgColor: "bg-indigo-100",
        pointsRequired: 450,
        category: "fantasy",
        type: "physical",
        accessible: true,
        stock: null
      },
      {
        id: 26,
        name: "Marvel Figurines",
        description: "Collectible Marvel superhero figurines",
        icon: "dragon",
        color: "text-indigo-600",
        bgColor: "bg-indigo-100",
        pointsRequired: 450,
        category: "fantasy",
        type: "physical",
        accessible: true,
        stock: null
      },

      // Trend Category
      {
        id: 21,
        name: "Trendy Gadget",
        description: "Latest trending tech gadget everyone is talking about",
        icon: "chart-line",
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        pointsRequired: 450,
        category: "trend",
        type: "physical",
        accessible: true,
        stock: null
      },

      // Apparel Category
      {
        id: 10,
        name: "Branded T-Shirt",
        description: "High-quality branded t-shirt in your size",
        icon: "tshirt",
        color: "text-green-600",
        bgColor: "bg-green-100",
        pointsRequired: 100,
        category: "apparel",
        type: "physical",
        accessible: true,
        stock: null
      },
      {
        id: 11,
        name: "Designer Hoodie",
        description: "Comfortable designer hoodie for casual wear",
        icon: "tshirt",
        color: "text-green-600",
        bgColor: "bg-green-100",
        pointsRequired: 200,
        category: "apparel",
        type: "physical",
        accessible: true,
        stock: null
      },
      {
        id: 12,
        name: "Formal Suit",
        description: "Professional formal suit for important occasions",
        icon: "tshirt",
        color: "text-green-600",
        bgColor: "bg-green-100",
        pointsRequired: 700,
        category: "apparel",
        type: "physical",
        accessible: true,
        stock: null
      },
      {
        id: 13,
        name: "Sneakers",
        description: "Latest trendy sneakers for daily wear",
        icon: "tshirt",
        color: "text-green-600",
        bgColor: "bg-green-100",
        pointsRequired: 350,
        category: "apparel",
        type: "physical",
        accessible: true,
        stock: null
      }
    ];

    // Batch write to add/update rewards
    const batch = db.batch();
    let addedCount = 0;
    let updatedCount = 0;

    for (const reward of rewards) {
      // Check if reward with this ID already exists
      const existingReward = await rewardsRef.where('id', '==', reward.id).limit(1).get();
      
      if (existingReward.empty) {
        // Add new reward
        const newRewardRef = rewardsRef.doc();
        batch.set(newRewardRef, {
          ...reward,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        addedCount++;
      } else {
        // Update existing reward
        const docId = existingReward.docs[0].id;
        const rewardRef = rewardsRef.doc(docId);
        batch.update(rewardRef, {
          ...reward,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        updatedCount++;
      }
    }

    await batch.commit();

    return {
      success: true,
      message: `Rewards initialized successfully`,
      added: addedCount,
      updated: updatedCount,
      total: rewards.length
    };
  } catch (error) {
    console.error('Error initializing rewards:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to initialize rewards',
      error.message
    );
  }
});

/**
 * Cloud Function to get all available rewards
 * Callable from the frontend
 * Note: Firebase callable functions handle CORS automatically
 */
exports.getRewards = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  try {
    const db = admin.firestore();
    const rewardsRef = db.collection('rewards');
    
    // Get all accessible rewards
    const snapshot = await rewardsRef
      .where('accessible', '==', true)
      .get();

    const rewards = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      rewards.push({
        ...data,
        // Use the numeric id from the document, or fallback to Firestore doc id
        id: data.id || doc.id,
        docId: doc.id // Also include Firestore doc ID for reference
      });
    });

    return {
      success: true,
      rewards: rewards,
      count: rewards.length
    };
  } catch (error) {
    console.error('Error fetching rewards:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to fetch rewards',
      error.message
    );
  }
});

/**
 * HTTP Cloud Function to get all available rewards with explicit CORS headers
 * This is a backup option if the callable function has CORS issues
 * Use this endpoint: https://us-central1-taskmanager-dfb36.cloudfunctions.net/getRewardsHttp
 */
exports.getRewardsHttp = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    // Get auth token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized - Missing or invalid authorization token'
      });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (authError) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized - Invalid token'
      });
      return;
    }

    const db = admin.firestore();
    const rewardsRef = db.collection('rewards');
    
    // Get all accessible rewards
    const snapshot = await rewardsRef
      .where('accessible', '==', true)
      .get();

    const rewards = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      rewards.push({
        ...data,
        // Use the numeric id from the document, or fallback to Firestore doc id
        id: data.id || doc.id,
        docId: doc.id // Also include Firestore doc ID for reference
      });
    });

    res.status(200).json({
      success: true,
      rewards: rewards,
      count: rewards.length
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rewards',
      message: error.message
    });
  }
});

