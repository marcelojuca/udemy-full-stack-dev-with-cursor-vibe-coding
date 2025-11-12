import { render, Container, Text, Button, TextboxNumeric, Checkbox, VerticalSpace, Divider, Inline, Tabs, Dropdown } from '@create-figma-plugin/ui'
import { h } from 'preact'
import { useState, useEffect, useRef } from 'preact/hooks'
import { emit, on } from '@create-figma-plugin/utilities'
import '!./output.css'

// Icon presets for common use cases
const ICON_PRESETS = [
  { name: 'Favicon', sizes: [[16, 16], [32, 32], [64, 64]] },
  { name: 'iOS Icons', sizes: [[120, 120], [180, 180], [256, 256]] },
  { name: 'Android', sizes: [[48, 48], [96, 96], [192, 192], [512, 512]] },
  { name: 'Web Icons', sizes: [[64, 64], [128, 128], [256, 256]] },
]

function Plugin() {
  const [width, setWidth] = useState<string>('100')
  const [height, setHeight] = useState<string>('100')
  const [preserveAspectRatio, setPreserveAspectRatio] = useState(true)
  const [selectionInfo, setSelectionInfo] = useState<{
    hasSelection: boolean;
    width?: number;
    height?: number;
    name?: string;
    plan?: 'free' | 'basic' | 'pro';
    remaining?: number;
    limit?: number;
    resetTime?: string;
  }>({ hasSelection: false })
  const [isResizing, setIsResizing] = useState(false)
  const [activeTab, setActiveTab] = useState<'resize' | 'pricing'>('resize')
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [tierInfo, setTierInfo] = useState<{
    [key: string]: { displayName: string; limit: number; isDaily: boolean; monthlyPrice: number };
  }>({})
  const [loadingTierInfo, setLoadingTierInfo] = useState(false)
  // Track if user has manually edited dimensions to prevent auto-overwriting
  const hasManuallyEdited = useRef(false)
  const previousHasSelection = useRef(false)
  // Track previous dimensions to detect when selection changes
  const previousWidth = useRef<number | null>(null)
  const previousHeight = useRef<number | null>(null)
  const previousName = useRef<string | null>(null)
  // Use refs to track current input values to avoid stale closures
  const widthRef = useRef<string>('100')
  const heightRef = useRef<string>('100')

  // Fetch tier information from main plugin thread
  const fetchTierInfo = async () => {
    setLoadingTierInfo(true)
    try {
      let receivedCount = 0
      let maxWaitTime = false

      const unsubscribeTierInfo = on('TIER_INFO', (data) => {
        console.log('UI received TIER_INFO:', data)
        receivedCount++
        setTierInfo(prev => {
          const updated = { ...prev }
          // Dynamically add tier by its plan identifier (free, basic, pro, enterprise, etc.)
          if (data.plan) {
            updated[data.plan] = {
              displayName: data.displayName,
              limit: data.limit,
              isDaily: data.isDaily,
              monthlyPrice: data.monthlyPrice
            }
          }
          return updated
        })

        // If we haven't received any tiers after 5 seconds, stop waiting
        // Otherwise keep listening for more tiers to be emitted
      })

      // Emit request to get all tiers (dynamically fetched from Stripe)
      emit('GET_ALL_TIERS')

      // Cleanup after timeout (wait for all tiers to be emitted)
      const timeoutId = setTimeout(() => {
        maxWaitTime = true
        unsubscribeTierInfo()
        setLoadingTierInfo(false)
        console.log(`[UI] Finished loading ${receivedCount} tiers`)
      }, 3000)

      return unsubscribeTierInfo
    } catch (error) {
      console.error('Error fetching tier info:', error)
      setLoadingTierInfo(false)
    }
  }

  useEffect(() => {
    // Get initial selection info
    emit('GET_SELECTION')

    // Fetch tier information
    fetchTierInfo()

    // Listen for selection updates
    const unsubscribeSelection = on('SELECTION_INFO', (data) => {
      console.log('UI received SELECTION_INFO:', data)
      const hadSelectionBefore = previousHasSelection.current
      setSelectionInfo(data)
      
      if (!data.hasSelection) {
        // No selection - reset tracking
        previousHasSelection.current = false
        previousWidth.current = null
        previousHeight.current = null
        previousName.current = null
        hasManuallyEdited.current = false
        return
      }
      
      // We have a selection - get current dimensions
      const currentWidth = data.width ? Math.round(data.width) : null
      const currentHeight = data.height ? Math.round(data.height) : null
      const currentName = data.name || null
      
      // Get current input values to compare (use refs to avoid stale closures)
      const currentInputWidth = widthRef.current ? parseFloat(widthRef.current) : null
      const currentInputHeight = heightRef.current ? parseFloat(heightRef.current) : null
      
      // Detect if selection changed:
      // 1. Selection just appeared (no selection -> selection)
      // 2. Dimensions changed compared to previous selection
      // 3. Name changed (definitely a different object)
      const selectionJustAppeared = !hadSelectionBefore
      const dimensionsChanged = currentWidth !== null && 
                                currentHeight !== null &&
                                (previousWidth.current !== currentWidth || 
                                 previousHeight.current !== currentHeight)
      const nameChanged = currentName !== null && 
                         previousName.current !== null &&
                         currentName !== previousName.current
      
      const selectionChanged = selectionJustAppeared || dimensionsChanged || nameChanged
      
      // Also check if the selection dimensions differ from what's currently in the input fields
      // This catches cases where selection changed but our tracking didn't detect it
      const inputDiffersFromSelection = currentWidth !== null && 
                                        currentHeight !== null &&
                                        (currentInputWidth !== currentWidth || 
                                         currentInputHeight !== currentHeight)
      
      // Reset manual edit flag when selection changes
      if (selectionChanged) {
        hasManuallyEdited.current = false
      }
      
      // Auto-update dimensions when:
      // 1. Selection changed (new selection or different object)
      // 2. OR input fields differ from current selection (catch-all for missed updates)
      // 3. User hasn't manually edited
      const shouldUpdate = (selectionChanged || inputDiffersFromSelection) && 
                          currentWidth !== null && 
                          currentHeight !== null && 
                          !hasManuallyEdited.current
      
      if (shouldUpdate) {
        console.log('Auto-updating dimensions:', {
          selectionJustAppeared,
          dimensionsChanged,
          nameChanged,
          inputDiffersFromSelection,
          previousWidth: previousWidth.current,
          previousHeight: previousHeight.current,
          currentWidth,
          currentHeight,
          currentInputWidth,
          currentInputHeight,
          name: currentName
        })
        const newWidth = currentWidth.toString()
        const newHeight = currentHeight.toString()
        setWidth(newWidth)
        setHeight(newHeight)
        // Update refs immediately
        widthRef.current = newWidth
        heightRef.current = newHeight
      }
      
      // Update tracking refs
      previousHasSelection.current = true
      previousWidth.current = currentWidth
      previousHeight.current = currentHeight
      previousName.current = currentName
    })

    const unsubscribeSuccess = on('RESIZE_SUCCESS', (data) => {
      setIsResizing(false)
      setSelectionInfo(prev => ({
        ...prev,
        remaining: data.remaining,
        plan: data.plan
      }))
      setTimeout(() => emit('GET_SELECTION'), 100)
    })

    const unsubscribeError = on('RESIZE_ERROR', () => {
      setIsResizing(false)
    })

    const unsubscribeBatch = on('BATCH_RESIZE_SUCCESS', (data) => {
      setIsResizing(false)
      setSelectionInfo(prev => ({
        ...prev,
        remaining: data.remaining
      }))
      emit('GET_SELECTION')
    })

    const unsubscribePayment = on('PAYMENT_COMPLETE', (data) => {
      setSelectionInfo(prev => ({
        ...prev,
        plan: data.plan,
        remaining: data.remaining
      }))
    })

    // Polling fallback - check every 500ms if selection changed
    // Note: Selection changes are handled in main.ts via figma.on('selectionchange')
    // The UI polls for updates as a fallback mechanism
    // This ensures detection even if selectionchange event doesn't fire
    const selectionPollInterval = setInterval(() => {
      emit('GET_SELECTION')
    }, 500)

    return () => {
      unsubscribeSelection()
      unsubscribeSuccess()
      unsubscribeError()
      unsubscribeBatch()
      unsubscribePayment()
      clearInterval(selectionPollInterval)
    }
  }, [])

  const handleResize = () => {
    const widthNum = parseFloat(width)
    const heightNum = parseFloat(height)

    if (!width || !height || isNaN(widthNum) || isNaN(heightNum) || widthNum <= 0 || heightNum <= 0) {
      // Validation error - could emit a message to show notification, but UI validation is sufficient
      return
    }

    setIsResizing(true)
    emit('RESIZE_IMAGE', { width: widthNum, height: heightNum, preserveAspectRatio })
  }

  const handleUseCurrentSize = () => {
    if (selectionInfo.hasSelection && selectionInfo.width && selectionInfo.height) {
      const newWidth = Math.round(selectionInfo.width).toString()
      const newHeight = Math.round(selectionInfo.height).toString()
      setWidth(newWidth)
      setHeight(newHeight)
      widthRef.current = newWidth
      heightRef.current = newHeight
      // Reset the flag so future auto-updates can work if user wants
      hasManuallyEdited.current = false
    }
  }

  const handleBatchResize = (presetName: string | null) => {
    if (!presetName) return
    
    const preset = ICON_PRESETS.find(p => p.name === presetName)
    if (!preset) return

    const variants = preset.sizes.map(([w, h]) => ({
      width: w,
      height: h,
      name: `${preset.name} ${w}×${h}`
    }))

    setIsResizing(true)
    emit('RESIZE_BATCH', { variants })
  }

  const handleOpenPayment = (planId: 'basic' | 'pro') => {
    emit('OPEN_PAYMENT', { planId })
  }

  const getTierBadgeColor = (plan?: string) => {
    switch (plan) {
      case 'pro': return '#6366f1'
      case 'basic': return '#3b82f6'
      default: return '#6b7280'
    }
  }

  const getTierLabel = (plan?: string) => {
    switch (plan) {
      case 'pro': return 'Pro'
      case 'basic': return 'Basic'
      default: return 'Free'
    }
  }

  const canUseFeature = () => {
    if (!selectionInfo.remaining) return false
    return selectionInfo.remaining > 0
  }

  return (
    <Container space="medium" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <Container space="small">
        <Inline space="small">
          <Text className="theme-text-primary"><b>Image Resizer Pro</b></Text>
          <div style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: getTierBadgeColor(selectionInfo.plan),
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 'bold'
          }}>
            {getTierLabel(selectionInfo.plan)}
          </div>
        </Inline>
      </Container>

      {/* Usage Info */}
      {selectionInfo.hasSelection && (
        <Container space="small">
          <div className="theme-bg-secondary" style={{
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            lineHeight: '1.5'
          }}>
            <Text className="theme-text-primary">{selectionInfo.name || 'Selected Node'}</Text>
            <Text className="theme-text-primary">{Math.round(selectionInfo.width || 0)} × {Math.round(selectionInfo.height || 0)}px</Text>
            {selectionInfo.remaining !== undefined && (
              <div style={{ marginTop: '4px', fontWeight: 'bold' }} className={selectionInfo.remaining === 0 ? 'theme-text-warning' : 'theme-text-success'}>
                {selectionInfo.remaining}/{selectionInfo.limit} uses remaining
                {selectionInfo.resetTime && selectionInfo.plan !== 'free' && (
                  <Text className="theme-text-secondary">Resets {selectionInfo.resetTime}</Text>
                )}
              </div>
            )}
          </div>
        </Container>
      )}

      <VerticalSpace space="small" />
      <Divider />
      <VerticalSpace space="small" />

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'resize' | 'pricing')}
        options={[
          { value: 'resize', children: 'Resize' },
          { value: 'pricing', children: 'Pricing' }
        ]}
      />

      <VerticalSpace space="small" />

      {/* RESIZE TAB */}
      {activeTab === 'resize' && (
        <Container space="medium" style={{ backgroundColor: 'var(--bg-primary)' }}>
          {!selectionInfo.hasSelection && (
            <Container space="small">
              <Text className="theme-text-error">No selection. Please select an image or frame.</Text>
              <VerticalSpace space="small" />
            </Container>
          )}

          <Container space="small">
            <Text className="theme-text-primary"><b>New Dimensions</b></Text>
            <VerticalSpace space="extraSmall" />

            <Container space="extraSmall">
              <Text className="theme-text-primary">Width:</Text>
              <TextboxNumeric
                value={width}
                onValueInput={(value) => {
                  setWidth(value)
                  widthRef.current = value
                  hasManuallyEdited.current = true
                }}
                placeholder="Width"
                minimum={1}
                disabled={!selectionInfo.hasSelection}
              />
            </Container>

            <VerticalSpace space="extraSmall" />

            <Container space="extraSmall">
              <Text className="theme-text-primary">Height:</Text>
              <TextboxNumeric
                value={height}
                onValueInput={(value) => {
                  setHeight(value)
                  heightRef.current = value
                  hasManuallyEdited.current = true
                }}
                placeholder="Height"
                minimum={1}
                disabled={!selectionInfo.hasSelection}
              />
            </Container>

            <VerticalSpace space="small" />

            <Checkbox
              value={preserveAspectRatio}
              onValueChange={setPreserveAspectRatio}
              disabled={!selectionInfo.hasSelection}
            >
              Preserve aspect ratio
            </Checkbox>

            <VerticalSpace space="small" />

            {/* Quick Presets Dropdown */}
            <Container space="small">
              <Text className="theme-text-primary"><b>Quick Presets</b></Text>
              <Text style={{ fontSize: '12px' }} className="theme-text-secondary">Create multiple sizes at once</Text>
              <VerticalSpace space="extraSmall" />
              <Dropdown
                value={selectedPreset || null}
                options={[
                  { value: '', text: 'Select a preset...' },
                  ...ICON_PRESETS.map(preset => ({
                    value: preset.name,
                    text: `${preset.name} (${preset.sizes.map(([w, h]) => `${w}×${h}`).join(', ')})`
                  }))
                ]}
                onValueChange={(value) => {
                  if (value && value !== '') {
                    setSelectedPreset(value)
                    handleBatchResize(value)
                  } else {
                    setSelectedPreset(null)
                  }
                }}
                disabled={!selectionInfo.hasSelection || isResizing || (selectionInfo.remaining || 0) < ICON_PRESETS[0].sizes.length}
                placeholder="Select a preset..."
              />
              {selectedPreset && selectionInfo.hasSelection && (
                <Text style={{ fontSize: '11px', marginTop: '4px' }} className="theme-text-secondary">
                  Will create {ICON_PRESETS.find(p => p.name === selectedPreset)?.sizes.length || 0} variant(s)
                </Text>
              )}
            </Container>

            <VerticalSpace space="small" />
            <Divider />
            <VerticalSpace space="small" />

            {!canUseFeature() && selectionInfo.hasSelection && (
              <Container space="small">
                <Text style={{ fontSize: '12px' }} className="theme-text-error">
                  You&apos;ve reached your {selectionInfo.plan} tier limit. Upgrade to continue.
                </Text>
              </Container>
            )}

            <Button
              onClick={handleResize}
              disabled={!selectionInfo.hasSelection || isResizing || !canUseFeature()}
            >
              {isResizing ? 'Resizing...' : 'Resize Image'}
            </Button>

            {selectionInfo.hasSelection && (
              <Container space="extraSmall">
                <VerticalSpace space="extraSmall" />
                <Button
                  onClick={handleUseCurrentSize}
                  secondary
                  disabled={isResizing}
                >
                  Use Current Size
                </Button>
              </Container>
            )}
          </Container>
        </Container>
      )}

      {/* PRICING TAB */}
      {activeTab === 'pricing' && (
        <Container space="medium" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <Text className="theme-text-primary"><b>Pricing Plans</b></Text>
          <VerticalSpace space="small" />

          {loadingTierInfo && (
            <Container space="small">
              <Text className="theme-text-secondary">Loading pricing information...</Text>
            </Container>
          )}

          {/* Dynamically render all tiers from Stripe */}
          {!loadingTierInfo && Object.keys(tierInfo).length > 0 ? (
            <Container space="medium">
              {Object.entries(tierInfo).map(([tierId, tier], index) => {
                const isCurrentPlan = selectionInfo.plan === tierId
                const getTierBorderColor = (id: string) => {
                  if (id === 'free') return '1px solid'
                  if (id === 'enterprise') return '2px solid #a855f7'
                  if (id === 'pro') return '2px solid #6366f1'
                  if (id === 'basic') return '2px solid #3b82f6'
                  return '2px solid #8b5cf6'
                }

                return (
                  <div key={tierId}>
                    <Container space="small" className={isCurrentPlan ? `theme-bg-plan-${tierId}` : ''} style={{
                      border: getTierBorderColor(tierId),
                      borderRadius: '8px',
                      padding: '12px'
                    }}>
                      <Inline space="extraSmall">
                        <Text className="theme-text-primary"><b>{tier.displayName}</b></Text>
                        {isCurrentPlan && <span style={{ fontSize: '11px' }} className="theme-text-success">✓ Current</span>}
                      </Inline>
                      <VerticalSpace space="extraSmall" />
                      <Text style={{ fontSize: '13px' }} className="theme-text-primary">
                        {tier.limit} {tier.isDaily ? 'resizes per day' : 'one-time resizes'}
                      </Text>
                      <Text style={{ fontSize: '12px' }} className="theme-text-secondary">
                        {tierId === 'free' ? 'Perfect for trying it out' : tierId === 'basic' ? 'Great for regular use' : tierId === 'pro' ? 'For professionals' : 'Unlimited everything'}
                      </Text>
                      <VerticalSpace space="small" />
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }} className="theme-text-primary">
                        {tier.monthlyPrice === 0 ? 'Free' : `$${(tier.monthlyPrice / 100).toFixed(2)} / month`}
                      </div>
                      {isCurrentPlan && selectionInfo.remaining !== undefined && (
                        <Text style={{ fontSize: '11px', marginTop: '4px' }} className="theme-text-success">
                          {selectionInfo.remaining} {tier.isDaily ? 'uses left today' : 'uses left'}
                        </Text>
                      )}
                      <VerticalSpace space="small" />
                      {tierId !== 'free' && (
                        <Button
                          onClick={() => handleOpenPayment(tierId as 'basic' | 'pro')}
                          disabled={isCurrentPlan}
                        >
                          {isCurrentPlan ? 'Current Plan' : 'Upgrade'}
                        </Button>
                      )}
                    </Container>
                    {index < Object.keys(tierInfo).length - 1 && <VerticalSpace space="small" />}
                  </div>
                )
              })}
            </Container>
          ) : (
            !loadingTierInfo && (
              <Container space="small">
                <Text className="theme-text-error">Unable to load pricing information. Please try again.</Text>
              </Container>
            )
          )}

          <VerticalSpace space="medium" />

          <Container space="small">
            <Text style={{ fontSize: '11px' }} className="theme-text-secondary">
              All plans include:
            </Text>
            <Text style={{ fontSize: '11px', marginTop: '4px' }} className="theme-text-secondary">
              ✓ Preserve aspect ratio<br/>
              ✓ Batch variant generation<br/>
              ✓ Icon presets<br/>
              ✓ Unlimited projects
            </Text>
          </Container>
        </Container>
      )}
    </Container>
  )
}

export default render(Plugin)
