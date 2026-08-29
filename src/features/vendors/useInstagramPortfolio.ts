import { useCallback, useEffect, useRef, useState } from 'react'
import { getInstagramPortfolioMock, type InstagramPortfolio } from '../../data/instagramPortfolioData'
import { InstagramApiError, fetchInstagramPortfolio } from '../../lib/instagramApi'
import type { Vendor } from '../../types'

function accountName(value: string): string {
  return value.replace(/^@/, '').trim()
}

interface PortfolioState {
  portfolio: InstagramPortfolio
  loading: boolean
  /** API 가 실패해 목업으로 되돌아간 이유. 정상일 때는 undefined. */
  fallbackReason?: string
}

function describe(error: unknown): string {
  if (error instanceof InstagramApiError) {
    switch (error.code) {
      case 'ACCOUNT_NOT_FOUND':
        return '공개 프로페셔널 계정을 찾지 못했습니다. 개인 계정이거나 사용자명이 다를 수 있습니다.'
      case 'RATE_LIMITED':
        return '요청 한도에 걸렸습니다. 잠시 후 다시 시도해주세요.'
      case 'TOKEN_INVALID':
        return '서버 토큰이 만료되었습니다. 관리자 확인이 필요합니다.'
      default:
        return error.message
    }
  }
  return '서버에 연결하지 못했습니다.'
}

/**
 * 서버 연동이 아직 없거나 조회에 실패한 업체는 목업으로 화면을 유지한다.
 * 실패를 빈 화면으로 보여주면 데이터가 없는 것인지 장애인지 구분되지 않는다.
 */
export function useInstagramPortfolio(vendor: Vendor): PortfolioState & { refresh: () => void } {
  const account = accountName(vendor.instagram)
  const [state, setState] = useState<PortfolioState>(() => ({
    portfolio: getInstagramPortfolioMock(vendor),
    loading: true,
  }))
  const abortRef = useRef<AbortController>(null)

  const load = useCallback(
    (refresh: boolean) => {
      if (!account) {
        setState({ portfolio: getInstagramPortfolioMock(vendor), loading: false, fallbackReason: '연동된 인스타그램 계정이 없습니다.' })
        return
      }

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setState((prev) => ({ ...prev, loading: true }))

      fetchInstagramPortfolio(account, { refresh, signal: controller.signal })
        .then((portfolio) => {
          if (controller.signal.aborted) return
          setState({ portfolio, loading: false })
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return
          setState({ portfolio: getInstagramPortfolioMock(vendor), loading: false, fallbackReason: describe(error) })
        })
    },
    [account, vendor],
  )

  useEffect(() => {
    load(false)
    return () => abortRef.current?.abort()
  }, [load])

  return { ...state, refresh: () => load(true) }
}
