export const json = {
  children: [
    {
      name: "genunix`syscall_mstate",
      value: 89,
    },
    {
      children: [
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          children: [
                            {
                              children: [
                                {
                                  children: [
                                    {
                                      name: "unix`page_lookup_create",
                                      value: 1,
                                    },
                                  ],
                                  name: "unix`page_lookup",
                                  value: 1,
                                },
                              ],
                              name: "ufs`ufs_getpage",
                              value: 1,
                            },
                          ],
                          name: "genunix`fop_getpage",
                          value: 1,
                        },
                        {
                          children: [
                            {
                              children: [
                                {
                                  children: [
                                    {
                                      children: [
                                        {
                                          children: [
                                            {
                                              name: "genunix`pvn_plist_init",
                                              value: 1,
                                            },
                                            {
                                              name: "unix`lgrp_mem_choose",
                                              value: 1,
                                            },
                                            {
                                              children: [
                                                {
                                                  children: [
                                                    {
                                                      children: [
                                                        {
                                                          name: "unix`mutex_enter",
                                                          value: 1,
                                                        },
                                                      ],
                                                      name: "unix`page_get_mnode_freelist",
                                                      value: 1,
                                                    },
                                                  ],
                                                  name: "unix`page_get_freelist",
                                                  value: 1,
                                                },
                                              ],
                                              name: "unix`page_create_va",
                                              value: 1,
                                            },
                                            {
                                              children: [
                                                {
                                                  name: "unix`page_lookup_create",
                                                  value: 1,
                                                },
                                              ],
                                              name: "unix`page_lookup",
                                              value: 1,
                                            },
                                          ],
                                          name: "genunix`swap_getapage",
                                          value: 4,
                                        },
                                      ],
                                      name: "genunix`swap_getpage",
                                      value: 4,
                                    },
                                  ],
                                  name: "genunix`fop_getpage",
                                  value: 4,
                                },
                                {
                                  children: [
                                    {
                                      children: [
                                        {
                                          name: "unix`hwblkclr",
                                          value: 3,
                                        },
                                      ],
                                      name: "unix`pfnzero",
                                      value: 3,
                                    },
                                  ],
                                  name: "unix`pagezero",
                                  value: 3,
                                },
                              ],
                              name: "genunix`anon_zero",
                              value: 7,
                            },
                          ],
                          name: "genunix`segvn_faultpage",
                          value: 7,
                        },
                        {
                          name: "ufs`ufs_getpage",
                          value: 1,
                        },
                        {
                          children: [
                            {
                              children: [
                                {
                                  children: [
                                    {
                                      children: [
                                        {
                                          children: [
                                            {
                                              children: [
                                                {
                                                  children: [
                                                    {
                                                      children: [
                                                        {
                                                          name: "unix`hment_compare",
                                                          value: 1,
                                                        },
                                                      ],
                                                      name: "genunix`avl_find",
                                                      value: 1,
                                                    },
                                                  ],
                                                  name: "genunix`avl_add",
                                                  value: 1,
                                                },
                                              ],
                                              name: "unix`hment_insert",
                                              value: 2,
                                            },
                                          ],
                                          name: "unix`hment_assign",
                                          value: 2,
                                        },
                                      ],
                                      name: "unix`hati_pte_map",
                                      value: 2,
                                    },
                                  ],
                                  name: "unix`hati_load_common",
                                  value: 2,
                                },
                              ],
                              name: "unix`hat_memload",
                              value: 2,
                            },
                          ],
                          name: "unix`hat_memload_region",
                          value: 2,
                        },
                      ],
                      name: "genunix`segvn_fault",
                      value: 11,
                    },
                  ],
                  name: "genunix`as_fault",
                  value: 12,
                },
                {
                  name: "genunix`segvn_fault",
                  value: 1,
                },
              ],
              name: "unix`pagefault",
              value: 13,
            },
          ],
          name: "unix`trap",
          value: 13,
        },
      ],
      name: "unix`0xfffffffffb8001d6",
      value: 13,
    },
    {
      name: "unix`0xfffffffffb800c7c",
      value: 42,
    },
    {
      name: "unix`0xfffffffffb800c81",
      value: 2,
    },
    {
      children: [
        {
          name: "genunix`gethrtime_unscaled",
          value: 4,
        },
        {
          children: [
            {
              children: [
                {
                  name: "unix`tsc_gethrtimeunscaled",
                  value: 11,
                },
                {
                  name: "unix`tsc_read",
                  value: 186,
                },
              ],
              name: "genunix`gethrtime_unscaled",
              value: 203,
            },
            {
              name: "unix`tsc_gethrtimeunscaled",
              value: 13,
            },
          ],
          name: "genunix`syscall_mstate",
          value: 355,
        },
        {
          name: "unix`atomic_add_64",
          value: 110,
        },
      ],
      name: "unix`0xfffffffffb800c86",
      value: 472,
    },
    {
      children: [
        {
          name: "genunix`audit_getstate",
          value: 27,
        },
        {
          name: "genunix`clear_stale_fd",
          value: 10,
        },
        {
          name: "genunix`disp_lock_exit",
          value: 27,
        },
        {
          children: [
            {
              name: "FSS`fss_preempt",
              value: 1,
            },
            {
              name: "genunix`audit_getstate",
              value: 15,
            },
            {
              name: "genunix`clear_stale_fd",
              value: 44,
            },
            {
              children: [
                {
                  name: "unix`clear_int_flag",
                  value: 39,
                },
                {
                  name: "unix`do_splx",
                  value: 1993,
                },
                {
                  children: [
                    {
                      children: [
                        {
                          children: [
                            {
                              name: "unix`do_splx",
                              value: 1,
                            },
                          ],
                          name: "genunix`disp_lock_exit_nopreempt",
                          value: 1,
                        },
                      ],
                      name: "unix`preempt",
                      value: 1,
                    },
                  ],
                  name: "unix`kpreempt",
                  value: 1,
                },
              ],
              name: "genunix`disp_lock_exit",
              value: 2096,
            },
            {
              name: "genunix`sigcheck",
              value: 1,
            },
            {
              children: [
                {
                  name: "unix`clear_int_flag",
                  value: 180,
                },
                {
                  name: "unix`splr",
                  value: 400,
                },
              ],
              name: "genunix`thread_lock",
              value: 670,
            },
            {
              name: "unix`do_splx",
              value: 31,
            },
            {
              name: "unix`i_ddi_splhigh",
              value: 23,
            },
            {
              name: "unix`lock_clear_splx",
              value: 28,
            },
            {
              name: "unix`lock_try",
              value: 778,
            },
            {
              name: "unix`lwp_getdatamodel",
              value: 6,
            },
            {
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          children: [
                            {
                              children: [
                                {
                                  name: "unix`tsc_gethrtimeunscaled",
                                  value: 1,
                                },
                              ],
                              name: "genunix`mstate_thread_onproc_time",
                              value: 1,
                            },
                          ],
                          name: "unix`caps_charge_adjust",
                          value: 1,
                        },
                      ],
                      name: "unix`cpucaps_charge",
                      value: 3,
                    },
                    {
                      children: [
                        {
                          name: "unix`cmt_balance",
                          value: 1,
                        },
                        {
                          children: [
                            {
                              name: "unix`bitset_in_set",
                              value: 1,
                            },
                          ],
                          name: "unix`cpu_wakeup_mwait",
                          value: 1,
                        },
                      ],
                      name: "unix`setbackdq",
                      value: 5,
                    },
                  ],
                  name: "FSS`fss_preempt",
                  value: 8,
                },
                {
                  name: "unix`do_splx",
                  value: 1,
                },
                {
                  children: [
                    {
                      name: "genunix`disp_lock_exit_high",
                      value: 1,
                    },
                    {
                      children: [
                        {
                          name: "unix`membar_enter",
                          value: 1,
                        },
                      ],
                      name: "unix`disp",
                      value: 1,
                    },
                    {
                      name: "unix`do_splx",
                      value: 1,
                    },
                    {
                      children: [
                        {
                          children: [
                            {
                              name: "genunix`schedctl_save",
                              value: 1,
                            },
                          ],
                          name: "genunix`savectx",
                          value: 2,
                        },
                      ],
                      name: "unix`resume",
                      value: 2,
                    },
                  ],
                  name: "unix`swtch",
                  value: 5,
                },
              ],
              name: "unix`preempt",
              value: 14,
            },
            {
              name: "unix`prunstop",
              value: 36,
            },
            {
              name: "unix`splr",
              value: 92,
            },
            {
              name: "unix`splx",
              value: 6,
            },
          ],
          name: "genunix`post_syscall",
          value: 4245,
        },
        {
          name: "genunix`thread_lock",
          value: 33,
        },
        {
          name: "unix`lwp_getdatamodel",
          value: 3,
        },
        {
          name: "unix`prunstop",
          value: 2,
        },
      ],
      name: "unix`0xfffffffffb800c91",
      value: 4361,
    },
    {
      children: [
        {
          name: "genunix`gethrtime_unscaled",
          value: 7,
        },
        {
          children: [
            {
              children: [
                {
                  name: "unix`tsc_gethrtimeunscaled",
                  value: 17,
                },
                {
                  name: "unix`tsc_read",
                  value: 160,
                },
              ],
              name: "genunix`gethrtime_unscaled",
              value: 182,
            },
            {
              name: "unix`tsc_gethrtimeunscaled",
              value: 12,
            },
          ],
          name: "genunix`syscall_mstate",
          value: 412,
        },
        {
          name: "unix`atomic_add_64",
          value: 95,
        },
      ],
      name: "unix`0xfffffffffb800ca0",
      value: 517,
    },
    {
      name: "unix`_sys_rtt",
      value: 6,
    },
    {
      children: [
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          children: [
                            {
                              name: "genunix`cpu_decay",
                              value: 1,
                            },
                          ],
                          name: "genunix`cpu_grow",
                          value: 1,
                        },
                      ],
                      name: "genunix`cpu_update_pct",
                      value: 1,
                    },
                  ],
                  name: "genunix`new_mstate",
                  value: 1,
                },
              ],
              name: "unix`trap",
              value: 1,
            },
          ],
          name: "unix`sys_rtt_common",
          value: 1,
        },
      ],
      name: "unix`_sys_rtt_ints_disabled",
      value: 1,
    },
    {
      children: [
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          children: [
                            {
                              children: [
                                {
                                  name: "doorfs`door_close",
                                  value: 1,
                                },
                              ],
                              name: "namefs`nm_close",
                              value: 1,
                            },
                          ],
                          name: "genunix`fop_close",
                          value: 1,
                        },
                      ],
                      name: "genunix`closef",
                      value: 1,
                    },
                  ],
                  name: "genunix`close_exec",
                  value: 1,
                },
              ],
              name: "genunix`exec_common",
              value: 1,
            },
          ],
          name: "genunix`exece",
          value: 1,
        },
      ],
      name: "unix`_sys_sysenter_post_swapgs",
      value: 1,
    },
    {
      children: [
        {
          name: "genunix`gethrtime_unscaled",
          value: 11,
        },
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          children: [
                            {
                              children: [
                                {
                                  children: [
                                    {
                                      children: [
                                        {
                                          children: [
                                            {
                                              children: [
                                                {
                                                  name: "unix`mtype_func",
                                                  value: 1,
                                                },
                                                {
                                                  name: "unix`mutex_enter",
                                                  value: 1,
                                                },
                                              ],
                                              name: "unix`page_get_mnode_freelist",
                                              value: 2,
                                            },
                                          ],
                                          name: "unix`page_get_freelist",
                                          value: 2,
                                        },
                                      ],
                                      name: "unix`page_create_va",
                                      value: 3,
                                    },
                                  ],
                                  name: "genunix`pvn_read_kluster",
                                  value: 3,
                                },
                              ],
                              name: "ufs`ufs_getpage_ra",
                              value: 3,
                            },
                          ],
                          name: "ufs`ufs_getpage",
                          value: 3,
                        },
                      ],
                      name: "genunix`fop_getpage",
                      value: 3,
                    },
                  ],
                  name: "genunix`segvn_faulta",
                  value: 3,
                },
              ],
              name: "genunix`as_faulta",
              value: 3,
            },
          ],
          name: "genunix`memcntl",
          value: 3,
        },
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          children: [
                            {
                              children: [
                                {
                                  children: [
                                    {
                                      children: [
                                        {
                                          name: "unix`htable_lookup",
                                          value: 1,
                                        },
                                      ],
                                      name: "unix`htable_walk",
                                      value: 1,
                                    },
                                  ],
                                  name: "unix`hat_unload_callback",
                                  value: 1,
                                },
                              ],
                              name: "genunix`segvn_unmap",
                              value: 1,
                            },
                          ],
                          name: "genunix`as_unmap",
                          value: 1,
                        },
                      ],
                      name: "unix`mmapobj_map_elf",
                      value: 1,
                    },
                  ],
                  name: "unix`mmapobj_map_interpret",
                  value: 1,
                },
              ],
              name: "unix`mmapobj",
              value: 1,
            },
          ],
          name: "genunix`mmapobjsys",
          value: 1,
        },
        {
          children: [
            {
              name: "genunix`copen",
              value: 7,
            },
            {
              children: [
                {
                  name: "genunix`audit_getstate",
                  value: 62,
                },
                {
                  children: [
                    {
                      name: "genunix`audit_falloc",
                      value: 8,
                    },
                    {
                      children: [
                        {
                          children: [
                            {
                              children: [
                                {
                                  children: [
                                    {
                                      children: [
                                        {
                                          name: "unix`swtch",
                                          value: 1,
                                        },
                                      ],
                                      name: "unix`preempt",
                                      value: 1,
                                    },
                                  ],
                                  name: "unix`kpreempt",
                                  value: 1,
                                },
                              ],
                              name: "unix`sys_rtt_common",
                              value: 1,
                            },
                          ],
                          name: "unix`_sys_rtt_ints_disabled",
                          value: 1,
                        },
                      ],
                      name: "genunix`audit_getstate",
                      value: 66,
                    },
                    {
                      name: "genunix`audit_unfalloc",
                      value: 32,
                    },
                    {
                      name: "genunix`crfree",
                      value: 9,
                    },
                    {
                      name: "genunix`crhold",
                      value: 5,
                    },
                    {
                      name: "genunix`cv_broadcast",
                      value: 16,
                    },
                    {
                      children: [
                        {
                          children: [
                            {
                              name: "genunix`kmem_cache_alloc",
                              value: 11,
                            },
                            {
                              children: [
                                {
                                  name: "genunix`kmem_cache_alloc",
                                  value: 66,
                                },
                                {
                                  name: "unix`mutex_enter",
                                  value: 122,
                                },
                                {
                                  name: "unix`mutex_exit",
                                  value: 46,
                                },
                              ],
                              name: "genunix`kmem_zalloc",
                              value: 280,
                            },
                            {
                              name: "unix`bzero",
                              value: 8,
                            },
                          ],
                          name: "genunix`audit_falloc",
                          value: 313,
                        },
                        {
                          name: "genunix`crhold",
                          value: 11,
                        },
                        {
                          name: "genunix`kmem_cache_alloc",
                          value: 49,
                        },
                        {
                          name: "genunix`kmem_zalloc",
                          value: 13,
                        },
                        {
                          children: [
                            {
                              name: "genunix`fd_find",
                              value: 13,
                            },
                            {
                              name: "genunix`fd_reserve",
                              value: 9,
                            },
                            {
                              children: [
                                {
                                  name: "genunix`fd_find",
                                  value: 161,
                                },
                                {
                                  name: "genunix`fd_reserve",
                                  value: 15,
                                },
                              ],
                              name: "genunix`ufalloc_file",
                              value: 294,
                            },
                            {
                              name: "unix`mutex_enter",
                              value: 197,
                            },
                            {
                              name: "unix`mutex_exit",
                              value: 29,
                            },
                          ],
                          name: "genunix`ufalloc",
                          value: 551,
                        },
                        {
                          name: "genunix`ufalloc_file",
                          value: 20,
                        },
                        {
                          name: "unix`atomic_add_32",
                          value: 134,
                        },
                        {
                          name: "unix`mutex_enter",
                          value: 99,
                        },
                        {
                          name: "unix`mutex_exit",
                          value: 58,
                        },
                      ],
                      name: "genunix`falloc",
                      value: 1363,
                    },
                    {
                      name: "genunix`fd_reserve",
                      value: 8,
                    },
                    {
                      name: "genunix`kmem_cache_alloc",
                      value: 9,
                    },
                    {
                      name: "genunix`kmem_cache_free",
                      value: 5,
                    },
                    {
                      name: "genunix`lookupnameat",
                      value: 69,
                    },
                    {
                      name: "genunix`set_errno",
                      value: 24,
                    },
                    {
                      children: [
                        {
                          name: "genunix`audit_getstate",
                          value: 31,
                        },
                        {
                          name: "genunix`cv_broadcast",
                          value: 25,
                        },
                        {
                          name: "genunix`fd_reserve",
                          value: 35,
                        },
                      ],
                      name: "genunix`setf",
                      value: 187,
                    },
                    {
                      name: "genunix`ufalloc",
                      value: 10,
                    },
                    {
                      children: [
                        {
                          children: [
                            {
                              name: "genunix`kmem_cache_free",
                              value: 5,
                            },
                            {
                              children: [
                                {
                                  name: "genunix`kmem_cache_free",
                                  value: 73,
                                },
                                {
                                  name: "unix`mutex_enter",
                                  value: 111,
                                },
                                {
                                  name: "unix`mutex_exit",
                                  value: 55,
                                },
                              ],
                              name: "genunix`kmem_free",
                              value: 288,
                            },
                          ],
                          name: "genunix`audit_unfalloc",
                          value: 340,
                        },
                        {
                          name: "genunix`crfree",
                          value: 13,
                        },
                        {
                          name: "genunix`kmem_cache_free",
                          value: 51,
                        },
                        {
                          name: "genunix`kmem_free",
                          value: 11,
                        },
                        {
                          name: "unix`atomic_add_32_nv",
                          value: 100,
                        },
                        {
                          name: "unix`mutex_enter",
                          value: 97,
                        },
                        {
                          name: "unix`mutex_exit",
                          value: 56,
                        },
                      ],
                      name: "genunix`unfalloc",
                      value: 729,
                    },
                    {
                      children: [
                        {
                          children: [
                            {
                              children: [
                                {
                                  children: [
                                    {
                                      name: "genunix`audit_getstate",
                                      value: 16,
                                    },
                                    {
                                      name: "genunix`fop_lookup",
                                      value: 55,
                                    },
                                    {
                                      children: [
                                        {
                                          name: "genunix`audit_getstate",
                                          value: 21,
                                        },
                                        {
                                          name: "genunix`crgetmapped",
                                          value: 55,
                                        },
                                        {
                                          name: "genunix`fop_inactive",
                                          value: 39,
                                        },
                                        {
                                          children: [
                                            {
                                              name: "genunix`crgetmapped",
                                              value: 57,
                                            },
                                            {
                                              name: "genunix`dnlc_lookup",
                                              value: 26,
                                            },
                                            {
                                              name: "genunix`fop_lookup",
                                              value: 85,
                                            },
                                            {
                                              name: "genunix`kmem_alloc",
                                              value: 73,
                                            },
                                            {
                                              name: "genunix`traverse",
                                              value: 30,
                                            },
                                            {
                                              name: "genunix`vfs_matchops",
                                              value: 28,
                                            },
                                            {
                                              children: [
                                                {
                                                  children: [
                                                    {
                                                      name: "genunix`kmem_cache_alloc",
                                                      value: 241,
                                                    },
                                                    {
                                                      name: "unix`mutex_enter",
                                                      value: 366,
                                                    },
                                                    {
                                                      name: "unix`mutex_exit",
                                                      value: 149,
                                                    },
                                                  ],
                                                  name: "genunix`kmem_alloc",
                                                  value: 934,
                                                },
                                                {
                                                  name: "genunix`kmem_cache_alloc",
                                                  value: 32,
                                                },
                                              ],
                                              name: "genunix`vn_setpath",
                                              value: 1969,
                                            },
                                            {
                                              children: [
                                                {
                                                  name: "genunix`crgetmapped",
                                                  value: 36,
                                                },
                                                {
                                                  children: [
                                                    {
                                                      name: "genunix`crgetmapped",
                                                      value: 58,
                                                    },
                                                    {
                                                      name: "genunix`dnlc_lookup",
                                                      value: 70,
                                                    },
                                                    {
                                                      name: "genunix`vn_rele",
                                                      value: 14,
                                                    },
                                                    {
                                                      name: "ufs`ufs_iaccess",
                                                      value: 91,
                                                    },
                                                    {
                                                      children: [
                                                        {
                                                          name: "genunix`crgetuid",
                                                          value: 30,
                                                        },
                                                        {
                                                          children: [
                                                            {
                                                              name: "genunix`memcmp",
                                                              value: 38,
                                                            },
                                                            {
                                                              children: [
                                                                {
                                                                  name: "genunix`memcmp",
                                                                  value: 277,
                                                                },
                                                              ],
                                                              name: "unix`bcmp",
                                                              value: 295,
                                                            },
                                                          ],
                                                          name: "genunix`dnlc_lookup",
                                                          value: 1843,
                                                        },
                                                        {
                                                          name: "genunix`secpolicy_vnode_access2",
                                                          value: 72,
                                                        },
                                                        {
                                                          name: "genunix`vn_rele",
                                                          value: 39,
                                                        },
                                                        {
                                                          children: [
                                                            {
                                                              name: "genunix`crgetuid",
                                                              value: 22,
                                                            },
                                                            {
                                                              name: "genunix`secpolicy_vnode_access2",
                                                              value: 217,
                                                            },
                                                          ],
                                                          name: "ufs`ufs_iaccess",
                                                          value: 648,
                                                        },
                                                        {
                                                          name: "unix`bcmp",
                                                          value: 42,
                                                        },
                                                        {
                                                          name: "unix`mutex_enter",
                                                          value: 980,
                                                        },
                                                        {
                                                          name: "unix`mutex_exit",
                                                          value: 350,
                                                        },
                                                        {
                                                          name: "unix`rw_enter",
                                                          value: 525,
                                                        },
                                                        {
                                                          name: "unix`rw_exit",
                                                          value: 439,
                                                        },
                                                      ],
                                                      name: "ufs`ufs_lookup",
                                                      value: 5399,
                                                    },
                                                  ],
                                                  name: "genunix`fop_lookup",
                                                  value: 6470,
                                                },
                                                {
                                                  name: "genunix`kmem_cache_alloc",
                                                  value: 39,
                                                },
                                                {
                                                  children: [
                                                    {
                                                      name: "genunix`rwst_exit",
                                                      value: 18,
                                                    },
                                                    {
                                                      name: "genunix`rwst_tryenter",
                                                      value: 32,
                                                    },
                                                    {
                                                      name: "genunix`vn_mountedvfs",
                                                      value: 11,
                                                    },
                                                    {
                                                      name: "genunix`vn_vfslocks_getlock",
                                                      value: 62,
                                                    },
                                                    {
                                                      name: "genunix`vn_vfslocks_rele",
                                                      value: 50,
                                                    },
                                                    {
                                                      children: [
                                                        {
                                                          name: "genunix`kmem_alloc",
                                                          value: 32,
                                                        },
                                                        {
                                                          name: "genunix`rwst_enter_common",
                                                          value: 32,
                                                        },
                                                        {
                                                          name: "genunix`rwst_init",
                                                          value: 28,
                                                        },
                                                        {
                                                          children: [
                                                            {
                                                              name: "genunix`rwst_enter_common",
                                                              value: 264,
                                                            },
                                                            {
                                                              name: "unix`mutex_enter",
                                                              value: 337,
                                                            },
                                                            {
                                                              name: "unix`mutex_exit",
                                                              value: 105,
                                                            },
                                                          ],
                                                          name: "genunix`rwst_tryenter",
                                                          value: 734,
                                                        },
                                                        {
                                                          children: [
                                                            {
                                                              name: "genunix`cv_init",
                                                              value: 53,
                                                            },
                                                            {
                                                              children: [
                                                                {
                                                                  children: [
                                                                    {
                                                                      name: "genunix`kmem_cpu_reload",
                                                                      value: 2,
                                                                    },
                                                                  ],
                                                                  name: "genunix`kmem_cache_alloc",
                                                                  value: 168,
                                                                },
                                                                {
                                                                  name: "unix`mutex_enter",
                                                                  value: 379,
                                                                },
                                                                {
                                                                  name: "unix`mutex_exit",
                                                                  value: 155,
                                                                },
                                                              ],
                                                              name: "genunix`kmem_alloc",
                                                              value: 795,
                                                            },
                                                            {
                                                              name: "genunix`kmem_cache_alloc",
                                                              value: 29,
                                                            },
                                                            {
                                                              children: [
                                                                {
                                                                  name: "genunix`cv_init",
                                                                  value: 65,
                                                                },
                                                                {
                                                                  name: "unix`mutex_init",
                                                                  value: 53,
                                                                },
                                                              ],
                                                              name: "genunix`rwst_init",
                                                              value: 236,
                                                            },
                                                            {
                                                              name: "unix`mutex_init",
                                                              value: 46,
                                                            },
                                                          ],
                                                          name: "genunix`vn_vfslocks_getlock",
                                                          value: 1357,
                                                        },
                                                        {
                                                          name: "unix`mutex_enter",
                                                          value: 727,
                                                        },
                                                        {
                                                          name: "unix`mutex_exit",
                                                          value: 371,
                                                        },
                                                      ],
                                                      name: "genunix`vn_vfsrlock",
                                                      value: 3342,
                                                    },
                                                    {
                                                      children: [
                                                        {
                                                          name: "genunix`cv_broadcast",
                                                          value: 25,
                                                        },
                                                        {
                                                          name: "genunix`kmem_free",
                                                          value: 35,
                                                        },
                                                        {
                                                          name: "genunix`rwst_destroy",
                                                          value: 32,
                                                        },
                                                        {
                                                          children: [
                                                            {
                                                              name: "genunix`cv_broadcast",
                                                              value: 40,
                                                            },
                                                          ],
                                                          name: "genunix`rwst_exit",
                                                          value: 167,
                                                        },
                                                        {
                                                          name: "genunix`vn_vfslocks_getlock",
                                                          value: 120,
                                                        },
                                                        {
                                                          children: [
                                                            {
                                                              name: "genunix`cv_destroy",
                                                              value: 77,
                                                            },
                                                            {
                                                              name: "genunix`kmem_cache_free",
                                                              value: 22,
                                                            },
                                                            {
                                                              children: [
                                                                {
                                                                  name: "genunix`kmem_cache_free",
                                                                  value: 154,
                                                                },
                                                                {
                                                                  name: "unix`mutex_enter",
                                                                  value: 316,
                                                                },
                                                                {
                                                                  name: "unix`mutex_exit",
                                                                  value: 148,
                                                                },
                                                              ],
                                                              name: "genunix`kmem_free",
                                                              value: 693,
                                                            },
                                                            {
                                                              children: [
                                                                {
                                                                  name: "genunix`cv_destroy",
                                                                  value: 42,
                                                                },
                                                                {
                                                                  name: "unix`mutex_destroy",
                                                                  value: 176,
                                                                },
                                                              ],
                                                              name: "genunix`rwst_destroy",
                                                              value: 296,
                                                            },
                                                            {
                                                              name: "unix`mutex_destroy",
                                                              value: 31,
                                                            },
                                                          ],
                                                          name: "genunix`vn_vfslocks_rele",
                                                          value: 1420,
                                                        },
                                                        {
                                                          name: "unix`mutex_enter",
                                                          value: 1202,
                                                        },
                                                        {
                                                          name: "unix`mutex_exit",
                                                          value: 512,
                                                        },
                                                      ],
                                                      name: "genunix`vn_vfsunlock",
                                                      value: 3578,
                                                    },
                                                  ],
                                                  name: "genunix`traverse",
                                                  value: 7243,
                                                },
                                                {
                                                  name: "genunix`vfs_getops",
                                                  value: 21,
                                                },
                                                {
                                                  children: [
                                                    {
                                                      name: "genunix`vfs_getops",
                                                      value: 157,
                                                    },
                                                    {
                                                      name: "unix`membar_consumer",
                                                      value: 123,
                                                    },
                                                  ],
                                                  name: "genunix`vfs_matchops",
                                                  value: 336,
                                                },
                                                {
                                                  name: "genunix`vn_alloc",
                                                  value: 20,
                                                },
                                                {
                                                  name: "genunix`vn_exists",
                                                  value: 17,
                                                },
                                                {
                                                  name: "genunix`vn_mountedvfs",
                                                  value: 30,
                                                },
                                                {
                                                  name: "genunix`vn_setops",
                                                  value: 41,
                                                },
                                                {
                                                  name: "genunix`vn_vfsrlock",
                                                  value: 13,
                                                },
                                                {
                                                  name: "genunix`vn_vfsunlock",
                                                  value: 40,
                                                },
                                                {
                                                  name: "lofs`lfind",
                                                  value: 26,
                                                },
                                                {
                                                  name: "lofs`lsave",
                                                  value: 27,
                                                },
                                                {
                                                  name: "lofs`makelfsnode",
                                                  value: 28,
                                                },
                                                {
                                                  children: [
                                                    {
                                                      name: "genunix`kmem_cache_alloc",
                                                      value: 234,
                                                    },
                                                    {
                                                      name: "genunix`kmem_cpu_reload",
                                                      value: 1,
                                                    },
                                                    {
                                                      children: [
                                                        {
                                                          name: "genunix`kmem_cache_alloc",
                                                          value: 179,
                                                        },
                                                        {
                                                          name: "genunix`vn_recycle",
                                                          value: 33,
                                                        },
                                                        {
                                                          children: [
                                                            {
                                                              children: [
                                                                {
                                                                  name: "genunix`vsd_free",
                                                                  value: 155,
                                                                },
                                                              ],
                                                              name: "genunix`vn_recycle",
                                                              value: 319,
                                                            },
                                                            {
                                                              name: "genunix`vsd_free",
                                                              value: 14,
                                                            },
                                                          ],
                                                          name: "genunix`vn_reinit",
                                                          value: 424,
                                                        },
                                                        {
                                                          name: "unix`mutex_enter",
                                                          value: 318,
                                                        },
                                                        {
                                                          name: "unix`mutex_exit",
                                                          value: 142,
                                                        },
                                                      ],
                                                      name: "genunix`vn_alloc",
                                                      value: 1189,
                                                    },
                                                    {
                                                      name: "genunix`vn_exists",
                                                      value: 50,
                                                    },
                                                    {
                                                      name: "genunix`vn_reinit",
                                                      value: 48,
                                                    },
                                                    {
                                                      name: "genunix`vn_setops",
                                                      value: 160,
                                                    },
                                                    {
                                                      name: "lofs`lfind",
                                                      value: 278,
                                                    },
                                                    {
                                                      name: "lofs`lsave",
                                                      value: 162,
                                                    },
                                                    {
                                                      name: "lofs`makelfsnode",
                                                      value: 82,
                                                    },
                                                    {
                                                      name: "lofs`table_lock_enter",
                                                      value: 220,
                                                    },
                                                    {
                                                      name: "unix`atomic_cas_64",
                                                      value: 318,
                                                    },
                                                    {
                                                      name: "unix`membar_consumer",
                                                      value: 237,
                                                    },
                                                    {
                                                      name: "unix`mutex_enter",
                                                      value: 640,
                                                    },
                                                    {
                                                      name: "unix`mutex_exit",
                                                      value: 138,
                                                    },
                                                  ],
                                                  name: "lofs`makelonode",
                                                  value: 4212,
                                                },
                                                {
                                                  name: "lofs`table_lock_enter",
                                                  value: 43,
                                                },
                                                {
                                                  name: "ufs`ufs_lookup",
                                                  value: 46,
                                                },
                                                {
                                                  name: "unix`atomic_add_32",
                                                  value: 325,
                                                },
                                                {
                                                  name: "unix`mutex_exit",
                                                  value: 26,
                                                },
                                              ],
                                              name: "lofs`lo_lookup",
                                              value: 19887,
                                            },
                                            {
                                              name: "lofs`makelonode",
                                              value: 39,
                                            },
                                            {
                                              name: "unix`bcopy",
                                              value: 896,
                                            },
                                            {
                                              name: "unix`mutex_enter",
                                              value: 947,
                                            },
                                            {
                                              name: "unix`mutex_exit",
                                              value: 337,
                                            },
                                            {
                                              children: [
                                                {
                                                  children: [
                                                    {
                                                      children: [
                                                        {
                                                          name: "unix`dispatch_hilevel",
                                                          value: 1,
                                                        },
                                                      ],
                                                      name: "unix`do_interrupt",
                                                      value: 1,
                                                    },
                                                  ],
                                                  name: "unix`_interrupt",
                                                  value: 1,
                                                },
                                              ],
                                              name: "unix`strlen",
                                              value: 2659,
                                            },
                                            {
                                              name: "zfs`specvp_check",
                                              value: 10,
                                            },
                                            {
                                              name: "zfs`zfs_fastaccesschk_execute",
                                              value: 4,
                                            },
                                            {
                                              children: [
                                                {
                                                  name: "genunix`crgetuid",
                                                  value: 6,
                                                },
                                                {
                                                  children: [
                                                    {
                                                      name: "genunix`memcmp",
                                                      value: 3,
                                                    },
                                                    {
                                                      children: [
                                                        {
                                                          name: "genunix`memcmp",
                                                          value: 38,
                                                        },
                                                      ],
                                                      name: "unix`bcmp",
                                                      value: 45,
                                                    },
                                                  ],
                                                  name: "genunix`dnlc_lookup",
                                                  value: 263,
                                                },
                                                {
                                                  name: "unix`bcmp",
                                                  value: 11,
                                                },
                                                {
                                                  name: "unix`mutex_enter",
                                                  value: 309,
                                                },
                                                {
                                                  name: "unix`mutex_exit",
                                                  value: 135,
                                                },
                                                {
                                                  name: "zfs`specvp_check",
                                                  value: 20,
                                                },
                                                {
                                                  children: [
                                                    {
                                                      name: "genunix`crgetuid",
                                                      value: 2,
                                                    },
                                                  ],
                                                  name: "zfs`zfs_fastaccesschk_execute",
                                                  value: 50,
                                                },
                                              ],
                                              name: "zfs`zfs_lookup",
                                              value: 946,
                                            },
                                          ],
                                          name: "genunix`fop_lookup",
                                          value: 29216,
                                        },
                                        {
                                          name: "genunix`fsop_root",
                                          value: 62,
                                        },
                                        {
                                          name: "genunix`pn_fixslash",
                                          value: 44,
                                        },
                                        {
                                          name: "genunix`pn_getcomponent",
                                          value: 454,
                                        },
                                        {
                                          children: [
                                            {
                                              children: [
                                                {
                                                  name: "lofs`lo_root",
                                                  value: 80,
                                                },
                                                {
                                                  name: "unix`mutex_enter",
                                                  value: 95,
                                                },
                                                {
                                                  name: "unix`mutex_exit",
                                                  value: 59,
                                                },
                                              ],
                                              name: "genunix`fsop_root",
                                              value: 297,
                                            },
                                            {
                                              name: "genunix`rwst_exit",
                                              value: 12,
                                            },
                                            {
                                              name: "genunix`rwst_tryenter",
                                              value: 37,
                                            },
                                            {
                                              name: "genunix`vn_mountedvfs",
                                              value: 20,
                                            },
                                            {
                                              name: "genunix`vn_rele",
                                              value: 19,
                                            },
                                            {
                                              name: "genunix`vn_vfslocks_getlock",
                                              value: 47,
                                            },
                                            {
                                              name: "genunix`vn_vfslocks_rele",
                                              value: 34,
                                            },
                                            {
                                              children: [
                                                {
                                                  name: "genunix`kmem_alloc",
                                                  value: 11,
                                                },
                                                {
                                                  name: "genunix`rwst_enter_common",
                                                  value: 28,
                                                },
                                                {
                                                  name: "genunix`rwst_init",
                                                  value: 13,
                                                },
                                                {
                                                  children: [
                                                    {
                                                      name: "genunix`rwst_enter_common",
                                                      value: 314,
                                                    },
                                                    {
                                                      name: "unix`mutex_enter",
                                                      value: 238,
                                                    },
                                                    {
                                                      name: "unix`mutex_exit",
                                                      value: 49,
                                                    },
                                                  ],
                                                  name: "genunix`rwst_tryenter",
                                                  value: 628,
                                                },
                                                {
                                                  children: [
                                                    {
                                                      name: "genunix`cv_init",
                                                      value: 56,
                                                    },
                                                    {
                                                      children: [
                                                        {
                                                          name: "genunix`kmem_cache_alloc",
                                                          value: 126,
                                                        },
                                                        {
                                                          name: "unix`mutex_enter",
                                                          value: 252,
                                                        },
                                                        {
                                                          name: "unix`mutex_exit",
                                                          value: 95,
                                                        },
                                                      ],
                                                      name: "genunix`kmem_alloc",
                                                      value: 533,
                                                    },
                                                    {
                                                      name: "genunix`kmem_cache_alloc",
                                                      value: 17,
                                                    },
                                                    {
                                                      children: [
                                                        {
                                                          name: "genunix`cv_init",
                                                          value: 49,
                                                        },
                                                        {
                                                          name: "unix`mutex_init",
                                                          value: 38,
                                                        },
                                                      ],
                                                      name: "genunix`rwst_init",
                                                      value: 173,
                                                    },
                                                    {
                                                      name: "unix`mutex_init",
                                                      value: 31,
                                                    },
                                                  ],
                                                  name: "genunix`vn_vfslocks_getlock",
                                                  value: 973,
                                                },
                                                {
                                                  name: "unix`mutex_enter",
                                                  value: 455,
                                                },
                                                {
                                                  name: "unix`mutex_exit",
                                                  value: 250,
                                                },
                                              ],
                                              name: "genunix`vn_vfsrlock",
                                              value: 2414,
                                            },
                                            {
                                              children: [
                                                {
                                                  name: "genunix`cv_broadcast",
                                                  value: 14,
                                                },
                                                {
                                                  name: "genunix`kmem_free",
                                                  value: 17,
                                                },
                                                {
                                                  name: "genunix`rwst_destroy",
                                                  value: 20,
                                                },
                                                {
                                                  children: [
                                                    {
                                                      name: "genunix`cv_broadcast",
                                                      value: 19,
                                                    },
                                                  ],
                                                  name: "genunix`rwst_exit",
                                                  value: 110,
                                                },
                                                {
                                                  name: "genunix`vn_vfslocks_getlock",
                                                  value: 79,
                                                },
                                                {
                                                  children: [
                                                    {
                                                      name: "genunix`cv_destroy",
                                                      value: 81,
                                                    },
                                                    {
                                                      name: "genunix`kmem_cache_free",
                                                      value: 18,
                                                    },
                                                    {
                                                      children: [
                                                        {
                                                          name: "genunix`kmem_cache_free",
                                                          value: 116,
                                                        },
                                                        {
                                                          name: "unix`mutex_enter",
                                                          value: 195,
                                                        },
                                                        {
                                                          name: "unix`mutex_exit",
                                                          value: 90,
                                                        },
                                                      ],
                                                      name: "genunix`kmem_free",
                                                      value: 457,
                                                    },
                                                    {
                                                      children: [
                                                        {
                                                          name: "genunix`cv_destroy",
                                                          value: 31,
                                                        },
                                                        {
                                                          name: "unix`mutex_destroy",
                                                          value: 53,
                                                        },
                                                      ],
                                                      name: "genunix`rwst_destroy",
                                                      value: 146,
                                                    },
                                                    {
                                                      name: "unix`mutex_destroy",
                                                      value: 17,
                                                    },
                                                  ],
                                                  name: "genunix`vn_vfslocks_rele",
                                                  value: 903,
                                                },
                                                {
                                                  name: "unix`mutex_enter",
                                                  value: 823,
                                                },
                                                {
                                                  name: "unix`mutex_exit",
                                                  value: 356,
                                                },
                                              ],
                                              name: "genunix`vn_vfsunlock",
                                              value: 2372,
                                            },
                                            {
                                              name: "lofs`lo_root",
                                              value: 31,
                                            },
                                            {
                                              name: "unix`mutex_enter",
                                              value: 95,
                                            },
                                            {
                                              name: "unix`mutex_exit",
                                              value: 56,
                                            },
                                          ],
                                          name: "genunix`traverse",
                                          value: 5557,
                                        },
                                        {
                                          name: "genunix`vn_mountedvfs",
                                          value: 43,
                                        },
                                        {
                                          children: [
                                            {
                                              name: "genunix`crgetmapped",
                                              value: 31,
                                            },
                                            {
                                              children: [
                                                {
                                                  name: "genunix`crgetmapped",
                                                  value: 41,
                                                },
                                                {
                                                  name: "lofs`freelonode",
                                                  value: 35,
                                                },
                                                {
                                                  children: [
                                                    {
                                                      name: "genunix`kmem_cache_free",
                                                      value: 29,
                                                    },
                                                    {
                                                      name: "genunix`vn_free",
                                                      value: 26,
                                                    },
                                                    {
                                                      name: "genunix`vn_invalid",
                                                      value: 20,
                                                    },
                                                    {
                                                      name: "genunix`vn_rele",
                                                      value: 25,
                                                    },
                                                    {
                                                      children: [
                                                        {
                                                          children: [
                                                            {
                                                              name: "genunix`kmem_cpu_reload",
                                                              value: 1,
                                                            },
                                                          ],
                                                          name: "genunix`kmem_cache_free",
                                                          value: 184,
                                                        },
                                                        {
                                                          name: "genunix`kmem_free",
                                                          value: 115,
                                                        },
                                                        {
                                                          children: [
                                                            {
                                                              children: [
                                                                {
                                                                  name: "genunix`kmem_cpu_reload",
                                                                  value: 4,
                                                                },
                                                              ],
                                                              name: "genunix`kmem_cache_free",
                                                              value: 215,
                                                            },
                                                            {
                                                              name: "genunix`kmem_cpu_reload",
                                                              value: 5,
                                                            },
                                                            {
                                                              children: [
                                                                {
                                                                  name: "genunix`kmem_cache_free",
                                                                  value: 209,
                                                                },
                                                                {
                                                                  name: "unix`mutex_enter",
                                                                  value: 299,
                                                                },
                                                                {
                                                                  name: "unix`mutex_exit",
                                                                  value: 160,
                                                                },
                                                              ],
                                                              name: "genunix`kmem_free",
                                                              value: 785,
                                                            },
                                                            {
                                                              name: "genunix`vsd_free",
                                                              value: 48,
                                                            },
                                                            {
                                                              name: "unix`mutex_enter",
                                                              value: 314,
                                                            },
                                                            {
                                                              name: "unix`mutex_exit",
                                                              value: 171,
                                                            },
                                                          ],
                                                          name: "genunix`vn_free",
                                                          value: 1663,
                                                        },
                                                        {
                                                          name: "genunix`vn_invalid",
                                                          value: 47,
                                                        },
                                                        {
                                                          name: "genunix`vn_rele",
                                                          value: 64,
                                                        },
                                                        {
                                                          name: "genunix`vsd_free",
                                                          value: 17,
                                                        },
                                                        {
                                                          name: "lofs`table_lock_enter",
                                                          value: 189,
                                                        },
                                                        {
                                                          name: "unix`membar_consumer",
                                                          value: 106,
                                                        },
                                                        {
                                                          name: "unix`mutex_enter",
                                                          value: 905,
                                                        },
                                                        {
                                                          name: "unix`mutex_exit",
                                                          value: 358,
                                                        },
                                                        {
                                                          name: "unix`strlen",
                                                          value: 1238,
                                                        },
                                                      ],
                                                      name: "lofs`freelonode",
                                                      value: 5313,
                                                    },
                                                    {
                                                      name: "lofs`table_lock_enter",
                                                      value: 44,
                                                    },
                                                    {
                                                      name: "unix`atomic_add_32",
                                                      value: 292,
                                                    },
                                                    {
                                                      name: "unix`mutex_enter",
                                                      value: 279,
                                                    },
                                                    {
                                                      name: "unix`mutex_exit",
                                                      value: 212,
                                                    },
                                                  ],
                                                  name: "lofs`lo_inactive",
                                                  value: 6307,
                                                },
                                              ],
                                              name: "genunix`fop_inactive",
                                              value: 6689,
                                            },
                                            {
                                              name: "lofs`lo_inactive",
                                              value: 21,
                                            },
                                          ],
                                          name: "genunix`vn_rele",
                                          value: 6943,
                                        },
                                        {
                                          name: "genunix`vn_setpath",
                                          value: 58,
                                        },
                                        {
                                          name: "genunix`vn_vfsrlock",
                                          value: 12,
                                        },
                                        {
                                          name: "genunix`vn_vfsunlock",
                                          value: 20,
                                        },
                                        {
                                          name: "lofs`lo_lookup",
                                          value: 65,
                                        },
                                        {
                                          name: "unix`mutex_enter",
                                          value: 575,
                                        },
                                        {
                                          name: "unix`mutex_exit",
                                          value: 379,
                                        },
                                        {
                                          name: "unix`strlen",
                                          value: 107,
                                        },
                                        {
                                          name: "zfs`zfs_lookup",
                                          value: 22,
                                        },
                                      ],
                                      name: "genunix`lookuppnvp",
                                      value: 44242,
                                    },
                                    {
                                      name: "genunix`pn_fixslash",
                                      value: 14,
                                    },
                                    {
                                      name: "genunix`pn_getcomponent",
                                      value: 41,
                                    },
                                    {
                                      name: "genunix`traverse",
                                      value: 17,
                                    },
                                    {
                                      name: "genunix`vn_mountedvfs",
                                      value: 56,
                                    },
                                    {
                                      name: "genunix`vn_rele",
                                      value: 73,
                                    },
                                    {
                                      children: [
                                        {
                                          name: "unix`mutex_delay_default",
                                          value: 1,
                                        },
                                        {
                                          name: "unix`tsc_read",
                                          value: 1,
                                        },
                                      ],
                                      name: "unix`mutex_vector_enter",
                                      value: 2,
                                    },
                                  ],
                                  name: "genunix`lookuppnatcred",
                                  value: 44681,
                                },
                                {
                                  name: "genunix`lookuppnvp",
                                  value: 10,
                                },
                                {
                                  children: [
                                    {
                                      name: "unix`copyinstr",
                                      value: 25,
                                    },
                                    {
                                      name: "unix`copystr",
                                      value: 598,
                                    },
                                  ],
                                  name: "genunix`pn_get_buf",
                                  value: 687,
                                },
                                {
                                  name: "unix`copyinstr",
                                  value: 18,
                                },
                                {
                                  name: "unix`mutex_enter",
                                  value: 320,
                                },
                                {
                                  name: "unix`mutex_exit",
                                  value: 163,
                                },
                              ],
                              name: "genunix`lookupnameatcred",
                              value: 45978,
                            },
                            {
                              name: "genunix`lookuppnatcred",
                              value: 12,
                            },
                            {
                              name: "genunix`pn_get_buf",
                              value: 13,
                            },
                          ],
                          name: "genunix`lookupnameat",
                          value: 46075,
                        },
                        {
                          name: "genunix`lookupnameatcred",
                          value: 22,
                        },
                      ],
                      name: "genunix`vn_openat",
                      value: 46342,
                    },
                    {
                      name: "unix`mutex_enter",
                      value: 303,
                    },
                    {
                      name: "unix`mutex_exit",
                      value: 38,
                    },
                  ],
                  name: "genunix`copen",
                  value: 49444,
                },
                {
                  name: "genunix`falloc",
                  value: 36,
                },
                {
                  name: "genunix`set_errno",
                  value: 9,
                },
                {
                  name: "genunix`setf",
                  value: 16,
                },
                {
                  name: "genunix`unfalloc",
                  value: 39,
                },
                {
                  name: "genunix`vn_openat",
                  value: 14,
                },
              ],
              name: "genunix`openat",
              value: 49647,
            },
          ],
          name: "genunix`open",
          value: 49669,
        },
        {
          name: "genunix`openat",
          value: 17,
        },
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      name: "genunix`dotoprocs",
                      value: 1,
                    },
                  ],
                  name: "genunix`doprio",
                  value: 1,
                },
              ],
              name: "genunix`priocntl_common",
              value: 1,
            },
          ],
          name: "genunix`priocntlsys",
          value: 1,
        },
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          children: [
                            {
                              children: [
                                {
                                  children: [
                                    {
                                      children: [
                                        {
                                          name: "genunix`dnlc_lookup",
                                          value: 1,
                                        },
                                      ],
                                      name: "ufs`ufs_lookup",
                                      value: 1,
                                    },
                                  ],
                                  name: "genunix`fop_lookup",
                                  value: 1,
                                },
                              ],
                              name: "lofs`lo_lookup",
                              value: 1,
                            },
                          ],
                          name: "genunix`fop_lookup",
                          value: 1,
                        },
                      ],
                      name: "genunix`lookuppnvp",
                      value: 1,
                    },
                  ],
                  name: "genunix`lookuppnatcred",
                  value: 1,
                },
              ],
              name: "genunix`lookuppn",
              value: 1,
            },
          ],
          name: "genunix`resolvepath",
          value: 1,
        },
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          children: [
                            {
                              children: [
                                {
                                  children: [
                                    {
                                      name: "genunix`kmem_cache_free",
                                      value: 1,
                                    },
                                  ],
                                  name: "genunix`kmem_free",
                                  value: 1,
                                },
                              ],
                              name: "genunix`removectx",
                              value: 1,
                            },
                          ],
                          name: "genunix`schedctl_lwp_cleanup",
                          value: 1,
                        },
                      ],
                      name: "genunix`exitlwps",
                      value: 1,
                    },
                    {
                      children: [
                        {
                          children: [
                            {
                              children: [
                                {
                                  children: [
                                    {
                                      children: [
                                        {
                                          children: [
                                            {
                                              children: [
                                                {
                                                  name: "unix`hment_compare",
                                                  value: 2,
                                                },
                                              ],
                                              name: "genunix`avl_find",
                                              value: 2,
                                            },
                                          ],
                                          name: "unix`hment_remove",
                                          value: 2,
                                        },
                                        {
                                          name: "unix`page_numtopp_nolock",
                                          value: 1,
                                        },
                                      ],
                                      name: "unix`hat_pte_unmap",
                                      value: 3,
                                    },
                                  ],
                                  name: "unix`hat_unload_callback",
                                  value: 3,
                                },
                              ],
                              name: "genunix`segvn_unmap",
                              value: 3,
                            },
                          ],
                          name: "genunix`as_free",
                          value: 3,
                        },
                      ],
                      name: "genunix`relvm",
                      value: 3,
                    },
                    {
                      children: [
                        {
                          children: [
                            {
                              children: [
                                {
                                  children: [
                                    {
                                      name: "genunix`vmem_free",
                                      value: 1,
                                    },
                                  ],
                                  name: "genunix`segkp_release_internal",
                                  value: 1,
                                },
                              ],
                              name: "genunix`segkp_release",
                              value: 1,
                            },
                          ],
                          name: "genunix`schedctl_freepage",
                          value: 1,
                        },
                      ],
                      name: "genunix`schedctl_proc_cleanup",
                      value: 1,
                    },
                  ],
                  name: "genunix`proc_exit",
                  value: 5,
                },
              ],
              name: "genunix`exit",
              value: 5,
            },
          ],
          name: "genunix`rexit",
          value: 5,
        },
        {
          children: [
            {
              children: [
                {
                  name: "unix`tsc_gethrtimeunscaled",
                  value: 43,
                },
                {
                  name: "unix`tsc_read",
                  value: 367,
                },
              ],
              name: "genunix`gethrtime_unscaled",
              value: 420,
            },
            {
              name: "unix`tsc_gethrtimeunscaled",
              value: 59,
            },
          ],
          name: "genunix`syscall_mstate",
          value: 1336,
        },
        {
          name: "unix`atomic_add_64",
          value: 205,
        },
      ],
      name: "unix`sys_syscall",
      value: 51908,
    },
  ],
  name: "root",
  value: 57412,
};
