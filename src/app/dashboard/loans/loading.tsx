import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function LoadingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-5 w-32" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Prestamos</CardTitle>
            <CardDescription>
              Busca y administra todos los prestamos del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex items-center space-x-2 flex-1">
                <Skeleton className="h-10 max-w-sm flex-1" />
                <Skeleton className="h-10 w-10" />
              </div>
              
              <div className="flex items-center space-x-2">
                <Skeleton className="h-10 w-[180px]" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>

            <div className="rounded-md border">
              <div className="p-4">
                <div className="grid grid-cols-8 gap-4 mb-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-18" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-8 gap-4 py-3 border-b last:border-b-0">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex items-center">
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-end space-x-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center space-x-2 mt-4">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-20" />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}