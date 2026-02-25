'use client'

import { useState } from "react";
import {Card,CardContent,CardFooter,CardHeader, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {  User,  Calendar,  ArrowRight, Loader2Icon} from "lucide-react";
import { TableCell, TableRow} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

type CaseTrackerGrid = {
    caseId: string;
    caseStatus: string;
    caseTitle: string;
    caseNumber: string;
    caseAttorney: string;
    createdAt: string;
    caseArchived?: boolean;
}

export const CaseTrackerGridView = ({caseId, caseStatus, caseTitle, caseNumber, caseAttorney, createdAt,caseArchived } : CaseTrackerGrid) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter()

  const handleDetailsClick = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    router.push(`/dashboard/case-tracker/case-view/${caseId}`);
  };
  return (
        <Card
          className="flex flex-col justify-between shadow-sm border-border/60 hover:shadow-md transition-shadow"
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start mb-4">

              {caseArchived ? (
                <Badge
                variant="destructive"
                className="border-none px-2.5 py-0.5 text-xs font-semibold"
                >
                  Archived
                </Badge>
              ):(
                <Badge variant="outline" className={`rounded-full px-3`}>
                  {caseStatus}
                </Badge>
              )}

            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-xl leading-none tracking-tight">
                {caseTitle}
              </h3>
              <p className="text-xs font-medium text-muted-foreground/80">
                Case ID: {caseNumber}
              </p>
            </div>
          </CardHeader>
          <CardContent className="pb-4 pt-2">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground/70" />
                <span className="text-muted-foreground">
                  Lead:{" "}
                  <span className="text-foreground/80">{caseAttorney}</span>
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground/70" />
                <span className="text-muted-foreground">
                  Created:{" "}
                  <span className="text-foreground/80">{createdAt}</span>
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex ml-auto pt-0">
            <Button
              variant="ghost"
              disabled={loading}
              onClick={handleDetailsClick}
              className="flex items-center gap-2"
            >
              Details
              {loading ? (
                <Loader2Icon className="animate-spin h-4 w-4" />
              ) : (
              <ArrowRight />
              )}
            </Button>
          </CardFooter>
        </Card>
  )
}

type CaseTrackerList = {
    caseId: string;
    caseStatus: string;
    caseTitle: string;
    caseNumber: string;
    caseAttorney: string;
    createdAt: string
    caseArchived?: boolean;
}

export const CaseTrackerListView = ({caseId, caseStatus, caseTitle, caseNumber, caseAttorney, createdAt, caseArchived }:CaseTrackerList) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter()

  const handleDetailsClick = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    router.push(`/dashboard/case-tracker/case-view/${caseId}`);
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span className="font-bold text-foreground">
            {caseTitle}
          </span>
          <span className="text-xs text-muted-foreground">
            {caseNumber}
          </span>
        </div>
      </TableCell>
      <TableCell>
        {caseArchived ? (
          <Badge
          variant="destructive"
          className="border-none px-2.5 py-0.5 text-xs"
          >
            Archived
          </Badge>
        ):(
          <Badge variant="outline" className={`rounded-full px-2.5 py-0.5`}>
            {caseStatus}
          </Badge>
        )}

      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <User className="h-3 w-3 text-muted-foreground" />
          {caseAttorney}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          {createdAt}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          disabled={loading}
          onClick={handleDetailsClick}
          className="flex items-center gap-2"
        >
          Details
          {loading ? (
            <Loader2Icon className="animate-spin h-4 w-4" />
          ) : (
          <ArrowRight />
          )}
        </Button>
      </TableCell>
    </TableRow>
  )
}
