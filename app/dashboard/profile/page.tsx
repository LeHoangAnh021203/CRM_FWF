"use client";

import React from "react";
import { UserPermissions } from "@/app/components/UserPermissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { useAuth } from "@/app/contexts/AuthContext";
import { User, Mail, Phone, Calendar, Shield } from "lucide-react";

export default function ProfilePage() {
  const { user, permissions, isAdmin } = useAuth();

  if (!user) {
    return (
      <div className="p-3 sm:p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">
          Manage your account information and view your permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
              {isAdmin && (
                <Badge variant="default" className="bg-red-500">
                  ADMIN
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {user.firstname?.[0]}{user.lastname?.[0]}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {user.firstname} {user.lastname}
                </h3>
                <p className="text-gray-500">@{user.username}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-gray-600">{user.phoneNumber || "Not provided"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Date of Birth</p>
                  <p className="text-sm text-gray-600">
                    {user.dob ? new Date(user.dob).toLocaleDateString() : "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-sm text-gray-600">{user.role}</p>
                </div>
              </div>

              {user.bio && (
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium mb-2">Bio</p>
                  <p className="text-sm text-gray-600">{user.bio}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Permissions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permissions & Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">
                  System Permissions ({permissions.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {permissions.length > 0 ? (
                    permissions.map((permission, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No specific permissions assigned</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">Account Status</h4>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${user.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {isAdmin && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Admin Privileges</h4>
                  <div className="space-y-2">
                    <Badge variant="default" className="bg-red-500">
                      Full System Access
                    </Badge>
                    <Badge variant="default" className="bg-orange-500">
                      User Management
                    </Badge>
                    <Badge variant="default" className="bg-purple-500">
                      System Settings
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legacy UserPermissions Component (for compatibility) */}
      <div className="mt-6">
        <UserPermissions />
      </div>
    </div>
  );
}
