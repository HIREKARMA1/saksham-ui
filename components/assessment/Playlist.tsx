"use client"

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'

export default function Playlist({ assessmentId }: { assessmentId: string }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const res = await apiClient.getAssessmentPlaylist(assessmentId, 5)
        if (!mounted) return
        setData(res)
      } catch (e: any) {
        console.error(e)
        setError(e?.message || 'Failed to load playlist')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [assessmentId])

  if (loading) return <div className="py-8"><Loader /></div>
  if (error) return <div className="py-4 text-red-600">{error}</div>
  if (!data || !data.playlist?.length) return <div className="py-4 text-gray-600">No playlist available</div>

  return (
    <div className="space-y-4">
      {data.playlist.map((item: any, idx: number) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle>{item.topic}</CardTitle>
            <CardDescription>Suggested videos to improve: {item.videos?.length || 0}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {item.videos?.map((v: any, i: number) => (
                <div key={i} className="p-2 border rounded-md">
                  <a href={v.url} target="_blank" rel="noreferrer" className="font-medium text-blue-600">{v.title || v.url}</a>
                  <div className="mt-2">
                    {/* Show a simple thumbnail embed if url contains watch?v= */}
                    {v.url && v.url.includes('watch') ? (
                      <iframe
                        src={v.url.replace('watch?v=', 'embed/')}
                        className="w-full h-40"
                        title={v.title}
                        allowFullScreen
                      />
                    ) : (
                      <a href={v.url} target="_blank" rel="noreferrer" className="text-sm text-gray-500">Open video</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
