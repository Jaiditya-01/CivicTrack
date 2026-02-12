import { motion } from 'framer-motion';
import { ChevronRight, AlertCircle, MessageSquare, MapPin, CheckCircle, User, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HelpPage() {
  const steps = [
    {
      title: "Getting Started",
      icon: <AlertCircle className="h-6 w-6 text-primary" />,
      description: "Learn how to get started with CivicTrack and report your first issue.",
      items: [
        "Create an account or log in to your existing account",
        "Verify your email address to activate your account",
        "Update your profile with your location details"
      ]
    },
    {
      title: "Reporting an Issue",
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      description: "How to report a civic issue in your area.",
      items: [
        "Click on 'Report Issue' in the navigation menu",
        "Select the category that best describes your issue",
        "Add a clear title and detailed description",
        "Upload photos to help authorities understand the problem",
        "Pin the exact location on the map",
        "Submit your report"
      ]
    },
    {
      title: "Tracking Your Report",
      icon: <MapPin className="h-6 w-6 text-primary" />,
      description: "How to track the status of your reported issues.",
      items: [
        "Go to 'My Complaints' in your dashboard",
        "View the status of each report (Submitted, In Progress, Resolved)",
        "Check for updates and comments from authorities",
        "Receive notifications about status changes"
      ]
    },
    {
      title: "After Submission",
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
      description: "What happens after you submit a report.",
      items: [
        "Your report is reviewed by our team",
        "Assigned to the relevant department",
        "You'll receive updates on the progress",
        "Get notified when the issue is resolved"
      ]
    },
    {
      title: "User Responsibilities",
      icon: <User className="h-6 w-6 text-primary" />,
      description: "Your role in making CivicTrack effective.",
      items: [
        "Provide accurate and truthful information",
        "Be respectful in your communications",
        "Follow up on your reports",
        "Mark issues as resolved when addressed"
      ]
    },
    {
      title: "Privacy & Safety",
      icon: <Shield className="h-6 w-6 text-primary" />,
      description: "How we protect your information.",
      items: [
        "Your personal information is kept secure",
        "Location data is only used for issue resolution",
        "You can delete your account at any time",
        "Read our Privacy Policy for more details"
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-foreground mb-4">How Can We Help You?</h1>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
          Follow these simple steps to report and track civic issues in your community.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-start space-x-4 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                {step.icon}
              </div>
              <h2 className="text-xl font-semibold text-foreground">{step.title}</h2>
            </div>
            <p className="text-muted-foreground mb-4">{step.description}</p>
            <ul className="space-y-2">
              {step.items.map((item, i) => (
                <li key={i} className="flex items-start">
                  <ChevronRight className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-16 bg-primary/5 border border-primary/20 rounded-xl p-8 text-center"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">Still Need Help?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          If you have any questions or need further assistance, please don't hesitate to contact our support team.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Contact Support
          </Link>
          <Link
            to="/faq"
            className="inline-flex items-center justify-center px-6 py-3 border border-border bg-card text-foreground rounded-lg font-medium hover:bg-accent/50 transition-colors"
          >
            Visit FAQ
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
