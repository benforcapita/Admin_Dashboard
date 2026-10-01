import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/forms/Input";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setIsSubmitting(true);
    setError("");

    const result = await login(email, password);
    submitting.current = false;
    setIsSubmitting(false);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Open your local CRM
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use <strong>michael@dundermifflin.com</strong> and{" "}
            <strong>demo demo</strong>
          </p>
        </div>

        <p className="text-sm text-center text-gray-600">
          Demo sign-in only. There is no server authentication. Never enter a
          real password.
        </p>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Email address"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div role="alert" className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading || isSubmitting}
            disabled={!email || !password}
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
};
