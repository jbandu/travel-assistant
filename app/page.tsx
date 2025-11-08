'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Brain,
  Globe,
  Shield,
  TrendingDown,
  Users,
  Calendar,
  FileText,
  Clock,
  Heart,
  MapPin,
  Plane,
  Hotel,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Award,
} from 'lucide-react';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Travel Assistant</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition">
                How It Works
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition">
                Pricing
              </a>
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Sign In
              </Link>
              <Link
                href="/pricing"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 via-white to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Travel Planning
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Plan Your Perfect Trip in{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Minutes, Not Hours
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
              Let AI do the heavy lifting. Get personalized itineraries, real-time flight & hotel prices,
              and smart recommendations tailored to your travel style.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold text-lg shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 hover:scale-105"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-xl hover:bg-gray-50 transition-all font-semibold text-lg"
              >
                See How It Works
              </a>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Demo */}
          <div className="relative max-w-6xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-3xl opacity-10"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-4">
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl aspect-video flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Your AI Travel Assistant
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    Screenshot/demo placeholder - Replace with actual product screenshot
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">Trips Planned</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">98%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">5hrs</div>
              <div className="text-gray-600">Avg. Time Saved</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">15%</div>
              <div className="text-gray-600">Cost Savings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Plan Amazing Trips
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed to make travel planning effortless and enjoyable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            {[
              {
                icon: Brain,
                title: 'AI-Powered Planning',
                description: 'Get personalized itineraries in seconds with our advanced AI that learns your preferences.',
                color: 'blue',
              },
              {
                icon: Plane,
                title: 'Flight Search',
                description: 'Real-time prices from 500+ airlines. Find the best deals with smart filters and alerts.',
                color: 'purple',
              },
              {
                icon: Hotel,
                title: 'Hotel Booking',
                description: 'Search thousands of hotels worldwide. Compare prices, amenities, and reviews instantly.',
                color: 'green',
              },
              {
                icon: TrendingDown,
                title: 'Price Alerts',
                description: 'Monitor your favorite routes and get notified when prices drop. Never miss a deal.',
                color: 'orange',
              },
              {
                icon: MapPin,
                title: 'Local Experiences',
                description: 'Discover hidden gems, top restaurants, and must-see attractions at your destination.',
                color: 'pink',
              },
              {
                icon: Heart,
                title: 'Bucket List',
                description: 'Track your dream destinations, set goals, and plan trips to check them off your list.',
                color: 'red',
              },
              {
                icon: Users,
                title: 'Travel Companions',
                description: 'Plan group trips easily. Share preferences, dietary needs, and accessibility requirements.',
                color: 'indigo',
              },
              {
                icon: Calendar,
                title: 'Calendar Sync',
                description: 'Automatic sync with Google/Apple Calendar. Never miss a flight or reservation.',
                color: 'cyan',
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Enterprise-grade encryption protects your sensitive travel data and documents.',
                color: 'gray',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className={`w-7 h-7 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Dream Trip in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600">
              From idea to itinerary in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Tell Us Your Preferences',
                description: 'Share your travel style, budget, dates, and interests. Our AI learns what you love.',
                icon: Heart,
              },
              {
                step: '02',
                title: 'Get AI-Powered Recommendations',
                description: 'Receive personalized itineraries, flight options, and hotel suggestions instantly.',
                icon: Sparkles,
              },
              {
                step: '03',
                title: 'Book & Enjoy',
                description: 'Review, customize, and book everything in one place. Then enjoy your perfect trip!',
                icon: Zap,
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-24 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent -z-10"></div>
                )}
                <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-blue-200 transition-all">
                  <div className="text-6xl font-bold text-blue-100 mb-4">{step.step}</div>
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                    <step.icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Loved by Travelers Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our users are saying about their experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Adventure Traveler',
                image: '👩‍💼',
                rating: 5,
                quote: 'This app saved me 5+ hours planning my Europe trip. The AI recommendations were spot-on!',
              },
              {
                name: 'Michael Chen',
                role: 'Business Traveler',
                image: '👨‍💻',
                rating: 5,
                quote: 'Price alerts alone saved me $300 on flights. The calendar integration is a game-changer.',
              },
              {
                name: 'Emily Rodriguez',
                role: 'Family Traveler',
                image: '👩‍👧‍👦',
                rating: 5,
                quote: 'Planning family trips is so much easier now. Love the dietary preferences and accessibility features!',
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-100"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{testimonial.image}</div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your travel lifestyle
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <p className="text-gray-600 mb-6">Perfect for occasional travelers</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  '3 trips per month',
                  '10 AI messages/month',
                  'Flight & hotel search',
                  '5 bucket list destinations',
                  'Community access',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="block w-full px-6 py-3 text-center bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition font-semibold"
              >
                Get Started
              </Link>
            </div>

            {/* Traveler Plan */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white relative scale-105 shadow-2xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-yellow-400 text-yellow-900 text-sm font-bold rounded-full">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Traveler</h3>
              <p className="text-blue-100 mb-6">Best for frequent travelers</p>
              <div className="mb-6">
                <span className="text-5xl font-bold">$9.99</span>
                <span className="text-blue-100">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  'Unlimited trips',
                  'Unlimited AI chat',
                  '10 price alerts',
                  'Advanced analytics',
                  'Calendar integration',
                  'PDF exports',
                  '14-day free trial',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="block w-full px-6 py-3 text-center bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Explorer Plan */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Explorer</h3>
              <p className="text-gray-600 mb-6">Premium travel experience</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">$24.99</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  'Everything in Traveler',
                  'Unlimited price alerts',
                  '24/7 support',
                  'Concierge service',
                  'Family account (5 members)',
                  'VIP perks',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="block w-full px-6 py-3 text-center bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-semibold"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: 'Can I cancel my subscription anytime?',
                a: 'Yes! You can cancel your subscription at any time. You\'ll continue to have access until the end of your current billing period.',
              },
              {
                q: 'Do I need a credit card for the free trial?',
                a: 'No credit card required for the Free plan. The Traveler plan includes a 14-day free trial that requires a credit card, but you won\'t be charged until the trial ends.',
              },
              {
                q: 'How does the AI travel planning work?',
                a: 'Our AI analyzes your preferences, travel style, budget, and past trips to generate personalized itineraries. It learns from your feedback to provide better recommendations over time.',
              },
              {
                q: 'Can I book flights and hotels directly?',
                a: 'Yes! We provide real-time search for flights and hotels. Direct booking will be available once we complete travel agency certification. For now, you can search and save your favorites.',
              },
              {
                q: 'Is my personal data secure?',
                a: 'Absolutely. We use enterprise-grade AES-256 encryption for sensitive data and follow industry best practices for security and privacy.',
              },
            ].map((faq, index) => (
              <details
                key={index}
                className="group bg-gray-50 rounded-xl p-6 cursor-pointer"
              >
                <summary className="flex items-center justify-between font-semibold text-lg text-gray-900">
                  {faq.q}
                  <span className="text-blue-600 group-open:rotate-180 transition-transform">
                    ↓
                  </span>
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Plan Your Next Adventure?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of travelers who are saving time and money with AI-powered trip planning
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 transition-all font-semibold text-lg"
            >
              Sign In
            </Link>
          </div>
          <p className="text-blue-100 mt-6 text-sm">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">API Docs</a></li>
                <li><a href="#" className="hover:text-white transition">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold">Travel Assistant</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 Travel Assistant. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
