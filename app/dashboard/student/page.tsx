"use client"

import { useCallback, useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { CareerHomeView } from '@/components/dashboard/CareerHomeView'
import { StudentBrandPageShell } from '@/components/dashboard/StudentBrandPageShell'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [careerHome, setCareerHome] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const studentName = user?.name || 'there'

  const fetchDashboardData = useCallback(async () => {
    try {
      const [home, data] = await Promise.all([
        apiClient.getCareerHome().catch(() => null),
        apiClient.getStudentDashboard().catch(() => null),
      ])
      setCareerHome(home)
      setStats(data)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchDashboardData()
  }, [fetchDashboardData])

  const onCompleteMission = async (missionId: string) => {
    await apiClient.completeCareerMission(missionId)
    await fetchDashboardData()
  }

  return (
    <DashboardLayout requiredUserType="student">
      <StudentBrandPageShell contentClassName="pb-16">
        {loading ? (
          <div className="mx-auto max-w-3xl space-y-8 animate-pulse py-8" aria-busy="true" aria-label="Loading career home">
            <div className="h-8 w-48 rounded-lg bg-[var(--sq-surface-2)]" />
            <div className="h-4 w-72 rounded bg-[var(--sq-surface-2)]" />
            <div className="h-40 w-full rounded-[var(--sq-radius-lg)] bg-[var(--sq-surface-2)]" />
            <div className="grid grid-cols-3 gap-6">
              <div className="h-20 rounded-lg bg-[var(--sq-surface-2)]" />
              <div className="h-20 rounded-lg bg-[var(--sq-surface-2)]" />
              <div className="h-20 rounded-lg bg-[var(--sq-surface-2)]" />
            </div>
          </div>
        ) : (
          <CareerHomeView
            studentName={studentName}
            careerHome={careerHome}
            stats={stats}
            onCompleteMission={onCompleteMission}
          />
        )}
      </StudentBrandPageShell>
    </DashboardLayout>
  )
}
