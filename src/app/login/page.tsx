"use client";

import { useState } from "react";
import { Swords, Mail, Lock } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: integrate auth (AWS Cognito, NextAuth, etc.)
    alert("Auth not yet configured. Add your auth provider.");
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <Swords className="w-12 h-12 text-aoe-accent mx-auto mb-4" />
          <h1 className="text-2xl font-medieval font-bold gold-gradient">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            {isSignUp
              ? "Create a free account to unlock AI-powered tools"
              : "Sign in to your AoE2.ai account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="input-field w-full pl-10"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="input-field w-full pl-10"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            {isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-aoe-accent hover:text-yellow-400 transition-colors"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Create one"}
          </button>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
