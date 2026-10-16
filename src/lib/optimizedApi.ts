// 🚀 Optimized API Client - Reduce Redundant Calls & Egress
// This consolidates multiple API calls and implements smart caching

import { 
  cacheManager, 
  studentProfileCache, 
  attendanceCache, 
  resultsCache,
  timetableCache
} from './cache';
import { BACKEND_BASE_URL } from './api';

// 🎯 Keep EXACT same API structure, just add caching
class OptimizedAPIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // 🎯 Make request with caching
  private async makeRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // 🎯 LOGIN - Keep exact same as your backend
  async loginWithFullData(mobileNumber: string, password: string, hcaptchaToken: string): Promise<any> {
    try {
      const response = await this.makeRequest('/login-with-token', {
        method: 'POST',
        body: JSON.stringify({
          username: mobileNumber,
          password: password,
          token: hcaptchaToken,
          application: 'netra'
        })
      });

      if (response.success && response.data) {
        const loginData = response.data.login || response.data;
        const accessToken = loginData.access_token;
        const refreshToken = loginData.refresh_token || 'no-refresh-token';
        const studentId = loginData.sub || '';
        
        if (accessToken) {
          const tokenExpiry = Date.now() + (8 * 60 * 60 * 1000);
          localStorage.setItem('kmit_access_token', accessToken);
          localStorage.setItem('kmit_refresh_token', refreshToken);
          localStorage.setItem('kmit_student_id', String(studentId));
          localStorage.setItem('kmit_token_expiry', String(tokenExpiry));
          console.log('✅ Tokens stored successfully in localStorage');
        }
      }

      return response;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  // 🎯 STUDENT PROFILE - Keep exact same route
  async getStudentProfile(): Promise<any> {
    const mobileNumber = this.getCurrentUserMobile();
    if (!mobileNumber) {
      throw new Error('No mobile number available');
    }

    // Get student ID from JWT token (like original api.ts)
    const studentId = this.getStudentIdFromToken();
    if (!studentId) {
      throw new Error('No student ID available from token');
    }

    // Check cache first
    const cached = studentProfileCache.get(mobileNumber);
    if (cached) {
      console.log('🎯 Returning cached student profile');
      return cached;
    }

    try {
      console.log('🔍 Fetching fresh student profile...');
      const response = await this.makeRequest(`/student-profile/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kmit_access_token')}`
        }
      });

      if (response && (response.data?.payload?.student || response.data?.student || response.payload?.student || response.data)) {
        // Cache the profile
        studentProfileCache.set(mobileNumber, response);
        return response;
      }

      throw new Error('Invalid student profile response structure');
    } catch (error) {
      console.error('❌ Failed to fetch student profile:', error);
      throw error;
    }
  }

  // 🎯 ATTENDANCE - Keep exact same route
  async getAttendance(): Promise<any> {
    const mobileNumber = this.getCurrentUserMobile();
    if (!mobileNumber) {
      throw new Error('No mobile number available');
    }

    // Check cache first
    const cached = attendanceCache.get(mobileNumber);
    if (cached) {
      console.log('🎯 Returning cached attendance data');
      return cached;
    }

    try {
      console.log('🔍 Fetching fresh attendance data...');
      const response = await this.makeRequest('/attendance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kmit_access_token')}`
        }
      });

      if (response && (response.data?.payload || response.data || response.payload)) {
        // Cache the attendance data
        attendanceCache.set(mobileNumber, response);
        return response;
      }

      throw new Error('Invalid attendance response structure');
    } catch (error) {
      console.error('❌ Failed to fetch attendance:', error);
      throw error;
    }
  }

  // 🎯 RESULTS - Keep exact same route
  async getResults(): Promise<any> {
    const mobileNumber = this.getCurrentUserMobile();
    if (!mobileNumber) {
      throw new Error('No mobile number available');
    }

    // Get student ID from JWT token (like original api.ts)
    const studentId = this.getStudentIdFromToken();
    if (!studentId) {
      throw new Error('No student ID available from token');
    }

    // Check cache first
    const cached = resultsCache.get(mobileNumber);
    if (cached) {
      console.log('🎯 Returning cached results data');
      return cached;
    }

    try {
      console.log('🔍 Fetching fresh results data...');
      const response = await this.makeRequest(`/results/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kmit_access_token')}`
        }
      });

      if (response && (response.data?.payload || response.data || response.payload)) {
        // Cache the results data
        resultsCache.set(mobileNumber, response);
        return response;
      }

      throw new Error('Invalid results response structure');
    } catch (error) {
      console.error('❌ Failed to fetch results:', error);
      throw error;
    }
  }

  // 🎯 INTERNAL RESULTS - Keep exact same route
  async getInternalResults(): Promise<any> {
    const mobileNumber = this.getCurrentUserMobile();
    if (!mobileNumber) {
      throw new Error('No mobile number available');
    }

    // Check cache first
    const cached = resultsCache.get(mobileNumber);
    if (cached) {
      console.log('🎯 Returning cached internal results');
      return cached;
    }

    try {
      console.log('🔍 Fetching internal results...');
      const response = await this.makeRequest('/internal-results', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kmit_access_token')}`
        }
      });

      if (response && (response.data?.payload || response.data || response.payload)) {
        return response;
      }

      throw new Error('Invalid internal results response structure');
    } catch (error) {
      console.error('❌ Failed to fetch internal results:', error);
      throw error;
    }
  }

  // 🎯 SEMESTER RESULTS - Keep exact same route
  async getSemesterResults(): Promise<any> {
    const mobileNumber = this.getCurrentUserMobile();
    if (!mobileNumber) {
      throw new Error('No mobile number available');
    }

    // Check cache first
    const cached = resultsCache.get(mobileNumber);
    if (cached) {
      console.log('🎯 Returning cached semester results');
      return cached;
    }

    try {
      console.log('🔍 Fetching semester results...');
      const response = await this.makeRequest('/semester-results', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kmit_access_token')}`
        }
      });

      if (response && (response.data?.payload || response.data || response.payload)) {
        return response;
      }

      throw new Error('Invalid semester results response structure');
    } catch (error) {
      console.error('❌ Failed to fetch semester results:', error);
      throw error;
    }
  }

  // 🎯 TIMETABLE - Keep exact same route
  async getTimetable(): Promise<any> {
    const mobileNumber = this.getCurrentUserMobile();
    if (!mobileNumber) {
      throw new Error('No mobile number available');
    }

    // Check cache first
    const cached = timetableCache.get(mobileNumber);
    if (cached) {
      console.log('🎯 Returning cached timetable');
      return cached;
    }

    try {
      console.log('🔍 Fetching fresh timetable...');
      const response = await this.makeRequest('/timetable', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kmit_access_token')}`
        }
      });

      if (response && (response.data?.payload || response.data || response.payload)) {
        // Cache the timetable
        timetableCache.set(mobileNumber, response);
        return response;
      }

      throw new Error('Invalid timetable response structure');
    } catch (error) {
      console.error('❌ Failed to fetch timetable:', error);
      throw error;
    }
  }

  // 🎯 SUBJECT ATTENDANCE - Keep exact same route
  async getSubjectAttendance(): Promise<any> {
    const mobileNumber = this.getCurrentUserMobile();
    if (!mobileNumber) {
      throw new Error('No mobile number available');
    }

    // Check cache first
    const cached = attendanceCache.get(mobileNumber);
    if (cached) {
      console.log('🎯 Returning cached subject attendance');
      return cached;
    }

    try {
      console.log('🔍 Fetching subject attendance...');
      const response = await this.makeRequest('/subject-attendance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kmit_access_token')}`
        }
      });

      if (response && (response.data?.payload || response.data || response.payload)) {
        return response;
      }

      throw new Error('Invalid subject attendance response structure');
    } catch (error) {
      console.error('❌ Failed to fetch subject attendance:', error);
      throw error;
    }
  }

  // 🎯 NOTICES COUNT - Keep exact same route
  async getNoticesCount(): Promise<any> {
    const mobileNumber = this.getCurrentUserMobile();
    if (!mobileNumber) {
      throw new Error('No mobile number available');
    }

    try {
      console.log('🔍 Fetching notices count...');
      const response = await this.makeRequest('/notices-count', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kmit_access_token')}`
        }
      });

      if (response) {
        return response;
      }

      throw new Error('Invalid notices count response structure');
    } catch (error) {
      console.error('❌ Failed to fetch notices count:', error);
      throw error;
    }
  }

  // 🎯 SEARCH STUDENTS - Keep exact same route
  async searchStudents(query: string): Promise<any> {
    try {
      console.log('🔍 Searching students...');
      const response = await this.makeRequest(`/search-students?q=${encodeURIComponent(query)}`);

      if (response && (response.data || response.results)) {
        return response;
      }

      throw new Error('Invalid search response structure');
    } catch (error) {
      console.error('❌ Failed to search students:', error);
      throw error;
    }
  }

  // 🎯 Get student ID from JWT token (like original api.ts)
  private getStudentIdFromToken(): number | null {
    try {
      const token = localStorage.getItem('kmit_access_token');
      if (!token) {
        return null;
      }
      
      // Decode JWT token to extract student ID
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decoded = JSON.parse(jsonPayload);
      
      if (decoded && decoded.sub) {
        console.log('Extracted studentId from JWT:', decoded.sub);
        return decoded.sub;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  }

  // 🎯 Get current user mobile number
  private getCurrentUserMobile(): string | null {
    try {
      // Try to get from localStorage or other sources
      const currentStudent = localStorage.getItem('currentStudent');
      if (currentStudent) {
        const parsed = JSON.parse(currentStudent);
        if (parsed.mobile_number || parsed.phone) {
          return parsed.mobile_number || parsed.phone;
        }
      }
      
      const studentId = localStorage.getItem('kmit_student_id');
      if (studentId) {
        return studentId;
      }
      
      // Try to get from profile cache
      const profileKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('cache_student_profile_')
      );
      
      if (profileKeys.length > 0) {
        const lastProfileKey = profileKeys[profileKeys.length - 1];
        return lastProfileKey.replace('cache_student_profile_', '');
      }
      
      return 'default_user';
    } catch (error) {
      console.warn('Failed to get current user mobile:', error);
      return localStorage.getItem('kmit_student_id') || 'default_user';
    }
  }

  // 🎯 Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('kmit_access_token');
    return Boolean(token);
  }

  // 🎯 Clear all caches (useful for logout)
  clearCaches(): void {
    cacheManager.clear();
    console.log('🧹 All caches cleared');
  }

  // 🎯 Logout and clear all tokens & caches
  async logout(): Promise<void> {
    const accessToken = localStorage.getItem('kmit_access_token');
    const refreshToken = localStorage.getItem('kmit_refresh_token') || '';
    
    if (accessToken) {
      try {
        await this.makeRequest('/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ refresh_token: refreshToken })
        }).catch(err => console.warn('Remote logout failed (safe to ignore):', err));
      } catch (e) {
        // Safe to ignore network error on logout
      }
    }

    this.clearCaches();
    localStorage.removeItem('kmit_access_token');
    localStorage.removeItem('kmit_refresh_token');
    localStorage.removeItem('kmit_student_id');
    localStorage.removeItem('kmit_token_expiry');
    localStorage.removeItem('currentStudent');
    localStorage.removeItem('currentTokens');
    console.log('🧹 OptimizedAPIClient: Logged out and cleared all tokens and caches');
  }

  // 🎯 Get cache statistics
  getCacheStats() {
    return cacheManager.getStats();
  }
}

// 🎯 Create and export the optimized API client
export const optimizedApiClient = new OptimizedAPIClient(BACKEND_BASE_URL);
